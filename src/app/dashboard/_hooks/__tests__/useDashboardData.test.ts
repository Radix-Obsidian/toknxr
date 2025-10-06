import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from '../useDashboardData';
import { useAuth } from '@/hooks/useAuth';

// Mock Firebase
jest.mock('@/firebase', () => ({
  db: {},
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
}));

describe('useDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state when no user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
    });

    const { result } = renderHook(() => useDashboardData());

    expect(result.current.interactions).toEqual([]);
    expect(result.current.stats).toEqual({
      totalCost: 0,
      wasteRate: 0,
      hallucinationFreq: 0,
    });
    expect(result.current.loading).toBe(false);
  });

  it('sets loading to true initially when user exists', () => {
    const mockUser = { uid: 'test-uid' };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
    });

    // Mock onSnapshot to not call the callback immediately
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation(() => jest.fn()); // Return unsubscribe function

    const { result } = renderHook(() => useDashboardData());

    expect(result.current.loading).toBe(true);
  });

  it('calculates stats correctly from interactions', async () => {
    const mockUser = { uid: 'test-uid' };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
    });

    const mockInteractions = [
      {
        id: '1',
        costUSD: 0.01,
        qualityRating: 'useful',
        hallucination: false,
      },
      {
        id: '2',
        costUSD: 0.02,
        qualityRating: 'wasted',
        hallucination: true,
      },
      {
        id: '3',
        costUSD: 0.03,
        qualityRating: 'partial',
        hallucination: false,
      },
    ];

    // Mock onSnapshot to call callback with mock data
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((query: any, callback: any) => {
      const mockQuerySnapshot = {
        docs: mockInteractions.map(interaction => ({
          id: interaction.id,
          data: () => interaction,
        })),
      };
      callback(mockQuerySnapshot);
      return jest.fn(); // Return unsubscribe function
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats.totalCost).toBe(0.06); // 0.01 + 0.02 + 0.03
    expect(result.current.stats.wasteRate).toBe(33.33333333333333); // 1/3 * 100
    expect(result.current.stats.hallucinationFreq).toBe(33.33333333333333); // 1/3 * 100
  });

  it('provides refetch function', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
    });

    const { result } = renderHook(() => useDashboardData());

    expect(typeof result.current.refetch).toBe('function');
  });
});