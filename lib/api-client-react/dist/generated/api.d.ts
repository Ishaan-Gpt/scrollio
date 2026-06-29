import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthResponse, BlockingStatus, BlockingStatusInput, DailyStats, ErrorResponse, GetLeaderboardParams, HealthStatus, LeaderboardEntry, LeetcodeStatus, LeetcodeVerifyInput, LeetcodeVerifyResponse, LoginInput, PublicProfile, RegisterInput, StatsInput, UserProfile, UserUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterUrl: () => string;
/**
 * @summary Register a new user
 */
export declare const register: (registerInput: RegisterInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterInput>;
export type RegisterMutationError = ErrorType<ErrorResponse>;
/**
* @summary Register a new user
*/
export declare const useRegister: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Log in
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
* @summary Log in
*/
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current user profile
 */
export declare const getMe: (options?: RequestInit) => Promise<UserProfile>;
export declare const getGetMeQueryKey: () => readonly ["/api/users/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current user profile
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateMeUrl: () => string;
/**
 * @summary Update current user profile
 */
export declare const updateMe: (userUpdate: UserUpdate, options?: RequestInit) => Promise<UserProfile>;
export declare const getUpdateMeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
    data: BodyType<UserUpdate>;
}, TContext>;
export type UpdateMeMutationResult = NonNullable<Awaited<ReturnType<typeof updateMe>>>;
export type UpdateMeMutationBody = BodyType<UserUpdate>;
export type UpdateMeMutationError = ErrorType<unknown>;
/**
* @summary Update current user profile
*/
export declare const useUpdateMe: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMe>>, TError, {
    data: BodyType<UserUpdate>;
}, TContext>;
export declare const getGetUserProfileUrl: (userId: number) => string;
/**
 * @summary Get public profile card for a user
 */
export declare const getUserProfile: (userId: number, options?: RequestInit) => Promise<PublicProfile>;
export declare const getGetUserProfileQueryKey: (userId: number) => readonly [`/api/users/${number}/profile`];
export declare const getGetUserProfileQueryOptions: <TData = Awaited<ReturnType<typeof getUserProfile>>, TError = ErrorType<ErrorResponse>>(userId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUserProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;
export type GetUserProfileQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get public profile card for a user
 */
export declare function useGetUserProfile<TData = Awaited<ReturnType<typeof getUserProfile>>, TError = ErrorType<ErrorResponse>>(userId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTodayStatsUrl: () => string;
/**
 * @summary Get today's usage stats for current user
 */
export declare const getTodayStats: (options?: RequestInit) => Promise<DailyStats>;
export declare const getGetTodayStatsQueryKey: () => readonly ["/api/stats/today"];
export declare const getGetTodayStatsQueryOptions: <TData = Awaited<ReturnType<typeof getTodayStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTodayStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTodayStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTodayStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getTodayStats>>>;
export type GetTodayStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get today's usage stats for current user
 */
export declare function useGetTodayStats<TData = Awaited<ReturnType<typeof getTodayStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTodayStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSyncStatsUrl: () => string;
/**
 * @summary Sync usage stats from device
 */
export declare const syncStats: (statsInput: StatsInput, options?: RequestInit) => Promise<DailyStats>;
export declare const getSyncStatsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof syncStats>>, TError, {
        data: BodyType<StatsInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof syncStats>>, TError, {
    data: BodyType<StatsInput>;
}, TContext>;
export type SyncStatsMutationResult = NonNullable<Awaited<ReturnType<typeof syncStats>>>;
export type SyncStatsMutationBody = BodyType<StatsInput>;
export type SyncStatsMutationError = ErrorType<unknown>;
/**
* @summary Sync usage stats from device
*/
export declare const useSyncStats: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof syncStats>>, TError, {
        data: BodyType<StatsInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof syncStats>>, TError, {
    data: BodyType<StatsInput>;
}, TContext>;
export declare const getGetStatsHistoryUrl: () => string;
/**
 * @summary Get stats history for last 30 days
 */
export declare const getStatsHistory: (options?: RequestInit) => Promise<DailyStats[]>;
export declare const getGetStatsHistoryQueryKey: () => readonly ["/api/stats/history"];
export declare const getGetStatsHistoryQueryOptions: <TData = Awaited<ReturnType<typeof getStatsHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStatsHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStatsHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStatsHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof getStatsHistory>>>;
export type GetStatsHistoryQueryError = ErrorType<unknown>;
/**
 * @summary Get stats history for last 30 days
 */
export declare function useGetStatsHistory<TData = Awaited<ReturnType<typeof getStatsHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStatsHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetLeaderboardUrl: (params?: GetLeaderboardParams) => string;
/**
 * @summary Get global leaderboard
 */
export declare const getLeaderboard: (params?: GetLeaderboardParams, options?: RequestInit) => Promise<LeaderboardEntry[]>;
export declare const getGetLeaderboardQueryKey: (params?: GetLeaderboardParams) => readonly ["/api/leaderboard", ...GetLeaderboardParams[]];
export declare const getGetLeaderboardQueryOptions: <TData = Awaited<ReturnType<typeof getLeaderboard>>, TError = ErrorType<unknown>>(params?: GetLeaderboardParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLeaderboardQueryResult = NonNullable<Awaited<ReturnType<typeof getLeaderboard>>>;
export type GetLeaderboardQueryError = ErrorType<unknown>;
/**
 * @summary Get global leaderboard
 */
export declare function useGetLeaderboard<TData = Awaited<ReturnType<typeof getLeaderboard>>, TError = ErrorType<unknown>>(params?: GetLeaderboardParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getVerifyLeetcodeUrl: () => string;
/**
 * @summary Verify LeetCode solves for today to unlock blocked apps
 */
export declare const verifyLeetcode: (leetcodeVerifyInput: LeetcodeVerifyInput, options?: RequestInit) => Promise<LeetcodeVerifyResponse>;
export declare const getVerifyLeetcodeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof verifyLeetcode>>, TError, {
        data: BodyType<LeetcodeVerifyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof verifyLeetcode>>, TError, {
    data: BodyType<LeetcodeVerifyInput>;
}, TContext>;
export type VerifyLeetcodeMutationResult = NonNullable<Awaited<ReturnType<typeof verifyLeetcode>>>;
export type VerifyLeetcodeMutationBody = BodyType<LeetcodeVerifyInput>;
export type VerifyLeetcodeMutationError = ErrorType<unknown>;
/**
* @summary Verify LeetCode solves for today to unlock blocked apps
*/
export declare const useVerifyLeetcode: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof verifyLeetcode>>, TError, {
        data: BodyType<LeetcodeVerifyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof verifyLeetcode>>, TError, {
    data: BodyType<LeetcodeVerifyInput>;
}, TContext>;
export declare const getGetLeetcodeStatusUrl: () => string;
/**
 * @summary Get today's LeetCode unlock status
 */
export declare const getLeetcodeStatus: (options?: RequestInit) => Promise<LeetcodeStatus>;
export declare const getGetLeetcodeStatusQueryKey: () => readonly ["/api/leetcode/status"];
export declare const getGetLeetcodeStatusQueryOptions: <TData = Awaited<ReturnType<typeof getLeetcodeStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLeetcodeStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLeetcodeStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLeetcodeStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getLeetcodeStatus>>>;
export type GetLeetcodeStatusQueryError = ErrorType<unknown>;
/**
 * @summary Get today's LeetCode unlock status
 */
export declare function useGetLeetcodeStatus<TData = Awaited<ReturnType<typeof getLeetcodeStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLeetcodeStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetBlockingStatusUrl: () => string;
/**
 * @summary Get current blocking status for apps
 */
export declare const getBlockingStatus: (options?: RequestInit) => Promise<BlockingStatus>;
export declare const getGetBlockingStatusQueryKey: () => readonly ["/api/blocking/status"];
export declare const getGetBlockingStatusQueryOptions: <TData = Awaited<ReturnType<typeof getBlockingStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBlockingStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBlockingStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBlockingStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getBlockingStatus>>>;
export type GetBlockingStatusQueryError = ErrorType<unknown>;
/**
 * @summary Get current blocking status for apps
 */
export declare function useGetBlockingStatus<TData = Awaited<ReturnType<typeof getBlockingStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBlockingStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateBlockingStatusUrl: () => string;
/**
 * @summary Update blocking status for apps
 */
export declare const updateBlockingStatus: (blockingStatusInput: BlockingStatusInput, options?: RequestInit) => Promise<BlockingStatus>;
export declare const getUpdateBlockingStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBlockingStatus>>, TError, {
        data: BodyType<BlockingStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateBlockingStatus>>, TError, {
    data: BodyType<BlockingStatusInput>;
}, TContext>;
export type UpdateBlockingStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateBlockingStatus>>>;
export type UpdateBlockingStatusMutationBody = BodyType<BlockingStatusInput>;
export type UpdateBlockingStatusMutationError = ErrorType<unknown>;
/**
* @summary Update blocking status for apps
*/
export declare const useUpdateBlockingStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBlockingStatus>>, TError, {
        data: BodyType<BlockingStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateBlockingStatus>>, TError, {
    data: BodyType<BlockingStatusInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map