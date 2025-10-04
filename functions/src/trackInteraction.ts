import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

interface AIInteraction {
  userId: string;
  timestamp: number;
  provider: 'anthropic' | 'openai' | 'ollama';
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD: number;
  taskType?: string;
  qualityRating?: 'useful' | 'partial' | 'wasted';
  errorDetected?: boolean;
  hallucination?: boolean;
}

export const trackInteraction = functions.https.onCall(
  async (request) => {
    // Validate auth
    if (!request.auth) throw new functions.https.HttpsError(
      'unauthenticated', 'User must be authenticated'
    );

    const data = request.data as AIInteraction;
    const uid = request.auth.uid;
    
    // Store interaction
    await admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('interactions')
      .add({
        ...data,
        userId: uid,
        timestamp: FieldValue.serverTimestamp(),
      });
    
    // Update user stats (atomic)
    await admin.firestore()
      .collection('users')
      .doc(uid)
      .set({
        totalInteractions: FieldValue.increment(1),
        totalTokens: FieldValue.increment(data.totalTokens),
        totalCost: FieldValue.increment(data.costUSD),
        lastActive: FieldValue.serverTimestamp(),
      }, { merge: true });
    
    return { success: true };
  }
);