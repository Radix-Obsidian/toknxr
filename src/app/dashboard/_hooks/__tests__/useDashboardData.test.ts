import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from '../useDashboardData';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../supabase';

// Mock Supabase
jest.mock('@/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state when no user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithGithub: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
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

  it('sets loading to true initially when user exists and then false after fetching', async () => {
    const mockUser = { id: 'test-uid' };
    mockUseAuth.mockReturnValue({
        user: mockUser as any,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInWithGoogle: jest.fn(),
        signInWithGithub: jest.fn(),
        logout: jest.fn(),
        resetPassword: jest.fn(),
        updateUserProfile: jest.fn(),
    });

    const { result } = renderHook(() => useDashboardData());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('calculates stats correctly from interactions', async () => {
    const mockUser = { id: 'test-uid' };
    mockUseAuth.mockReturnValue({
        user: mockUser as any,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInWithGoogle: jest.fn(),
        signInWithGithub: jest.fn(),
        logout: jest.fn(),
        resetPassword: jest.fn(),
        updateUserProfile: jest.fn(),
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

    (supabase.from('interactions').select('*').eq('user_id', 'test-uid').order as jest.Mock).mockResolvedValue({ data: mockInteractions, error: null });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats.totalCost).toBe(0.06); // 0.01 + 0.02 + 0.03
    expect(result.current.stats.wasteRate).toBeCloseTo(33.33333333333333); // 1/3 * 100
    expect(result.current.stats.hallucinationFreq).toBeCloseTo(33.33333333333333); // 1/3 * 100
  });

  it('provides refetch function', () => {
    mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInWithGoogle: jest.fn(),
        signInWithGithub: jest.fn(),
        logout: jest.fn(),
        resetPassword: jest.fn(),
        updateUserProfile: jest.fn(),
    });

    const { result } = renderHook(() => useDashboardData());

    expect(typeof result.current.refetch).toBe('function');
  });
});
