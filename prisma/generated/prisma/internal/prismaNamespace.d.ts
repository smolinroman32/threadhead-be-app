import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> = [
    PrismaClientOptions
] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? ((Without<T, U> & U) | (Without<U, T> & T)) & object : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly OpportunityFeed: "OpportunityFeed";
    readonly OpportunitySearchQuery: "OpportunitySearchQuery";
    readonly Opportunity: "Opportunity";
    readonly SearchQuery: "SearchQuery";
    readonly ThreadsAccount: "ThreadsAccount";
    readonly User: "User";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "opportunityFeed" | "opportunitySearchQuery" | "opportunity" | "searchQuery" | "threadsAccount" | "user";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        OpportunityFeed: {
            payload: Prisma.$OpportunityFeedPayload<ExtArgs>;
            fields: Prisma.OpportunityFeedFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OpportunityFeedFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OpportunityFeedFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload>;
                };
                findFirst: {
                    args: Prisma.OpportunityFeedFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OpportunityFeedFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload>;
                };
                findMany: {
                    args: Prisma.OpportunityFeedFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload>[];
                };
                create: {
                    args: Prisma.OpportunityFeedCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload>;
                };
                createMany: {
                    args: Prisma.OpportunityFeedCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.OpportunityFeedCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload>[];
                };
                delete: {
                    args: Prisma.OpportunityFeedDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload>;
                };
                update: {
                    args: Prisma.OpportunityFeedUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload>;
                };
                deleteMany: {
                    args: Prisma.OpportunityFeedDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OpportunityFeedUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.OpportunityFeedUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload>[];
                };
                upsert: {
                    args: Prisma.OpportunityFeedUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityFeedPayload>;
                };
                aggregate: {
                    args: Prisma.OpportunityFeedAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOpportunityFeed>;
                };
                groupBy: {
                    args: Prisma.OpportunityFeedGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OpportunityFeedGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OpportunityFeedCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OpportunityFeedCountAggregateOutputType> | number;
                };
            };
        };
        OpportunitySearchQuery: {
            payload: Prisma.$OpportunitySearchQueryPayload<ExtArgs>;
            fields: Prisma.OpportunitySearchQueryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OpportunitySearchQueryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OpportunitySearchQueryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload>;
                };
                findFirst: {
                    args: Prisma.OpportunitySearchQueryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OpportunitySearchQueryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload>;
                };
                findMany: {
                    args: Prisma.OpportunitySearchQueryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload>[];
                };
                create: {
                    args: Prisma.OpportunitySearchQueryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload>;
                };
                createMany: {
                    args: Prisma.OpportunitySearchQueryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.OpportunitySearchQueryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload>[];
                };
                delete: {
                    args: Prisma.OpportunitySearchQueryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload>;
                };
                update: {
                    args: Prisma.OpportunitySearchQueryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload>;
                };
                deleteMany: {
                    args: Prisma.OpportunitySearchQueryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OpportunitySearchQueryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.OpportunitySearchQueryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload>[];
                };
                upsert: {
                    args: Prisma.OpportunitySearchQueryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunitySearchQueryPayload>;
                };
                aggregate: {
                    args: Prisma.OpportunitySearchQueryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOpportunitySearchQuery>;
                };
                groupBy: {
                    args: Prisma.OpportunitySearchQueryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OpportunitySearchQueryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OpportunitySearchQueryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OpportunitySearchQueryCountAggregateOutputType> | number;
                };
            };
        };
        Opportunity: {
            payload: Prisma.$OpportunityPayload<ExtArgs>;
            fields: Prisma.OpportunityFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OpportunityFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OpportunityFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload>;
                };
                findFirst: {
                    args: Prisma.OpportunityFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OpportunityFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload>;
                };
                findMany: {
                    args: Prisma.OpportunityFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload>[];
                };
                create: {
                    args: Prisma.OpportunityCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload>;
                };
                createMany: {
                    args: Prisma.OpportunityCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.OpportunityCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload>[];
                };
                delete: {
                    args: Prisma.OpportunityDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload>;
                };
                update: {
                    args: Prisma.OpportunityUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload>;
                };
                deleteMany: {
                    args: Prisma.OpportunityDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OpportunityUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.OpportunityUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload>[];
                };
                upsert: {
                    args: Prisma.OpportunityUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OpportunityPayload>;
                };
                aggregate: {
                    args: Prisma.OpportunityAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOpportunity>;
                };
                groupBy: {
                    args: Prisma.OpportunityGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OpportunityGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OpportunityCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OpportunityCountAggregateOutputType> | number;
                };
            };
        };
        SearchQuery: {
            payload: Prisma.$SearchQueryPayload<ExtArgs>;
            fields: Prisma.SearchQueryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SearchQueryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SearchQueryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload>;
                };
                findFirst: {
                    args: Prisma.SearchQueryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SearchQueryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload>;
                };
                findMany: {
                    args: Prisma.SearchQueryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload>[];
                };
                create: {
                    args: Prisma.SearchQueryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload>;
                };
                createMany: {
                    args: Prisma.SearchQueryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SearchQueryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload>[];
                };
                delete: {
                    args: Prisma.SearchQueryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload>;
                };
                update: {
                    args: Prisma.SearchQueryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload>;
                };
                deleteMany: {
                    args: Prisma.SearchQueryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SearchQueryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SearchQueryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload>[];
                };
                upsert: {
                    args: Prisma.SearchQueryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SearchQueryPayload>;
                };
                aggregate: {
                    args: Prisma.SearchQueryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSearchQuery>;
                };
                groupBy: {
                    args: Prisma.SearchQueryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SearchQueryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SearchQueryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SearchQueryCountAggregateOutputType> | number;
                };
            };
        };
        ThreadsAccount: {
            payload: Prisma.$ThreadsAccountPayload<ExtArgs>;
            fields: Prisma.ThreadsAccountFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ThreadsAccountFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ThreadsAccountFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload>;
                };
                findFirst: {
                    args: Prisma.ThreadsAccountFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ThreadsAccountFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload>;
                };
                findMany: {
                    args: Prisma.ThreadsAccountFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload>[];
                };
                create: {
                    args: Prisma.ThreadsAccountCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload>;
                };
                createMany: {
                    args: Prisma.ThreadsAccountCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ThreadsAccountCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload>[];
                };
                delete: {
                    args: Prisma.ThreadsAccountDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload>;
                };
                update: {
                    args: Prisma.ThreadsAccountUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload>;
                };
                deleteMany: {
                    args: Prisma.ThreadsAccountDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ThreadsAccountUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ThreadsAccountUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload>[];
                };
                upsert: {
                    args: Prisma.ThreadsAccountUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ThreadsAccountPayload>;
                };
                aggregate: {
                    args: Prisma.ThreadsAccountAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateThreadsAccount>;
                };
                groupBy: {
                    args: Prisma.ThreadsAccountGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ThreadsAccountGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ThreadsAccountCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ThreadsAccountCountAggregateOutputType> | number;
                };
            };
        };
        User: {
            payload: Prisma.$UserPayload<ExtArgs>;
            fields: Prisma.UserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findFirst: {
                    args: Prisma.UserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findMany: {
                    args: Prisma.UserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                create: {
                    args: Prisma.UserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                createMany: {
                    args: Prisma.UserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                delete: {
                    args: Prisma.UserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                update: {
                    args: Prisma.UserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                deleteMany: {
                    args: Prisma.UserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                upsert: {
                    args: Prisma.UserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                aggregate: {
                    args: Prisma.UserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUser>;
                };
                groupBy: {
                    args: Prisma.UserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const OpportunityFeedScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly intent: "intent";
    readonly includeTerms: "includeTerms";
    readonly excludeTerms: "excludeTerms";
    readonly languages: "languages";
    readonly freshnessHours: "freshnessHours";
    readonly minScore: "minScore";
    readonly isActive: "isActive";
    readonly userId: "userId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type OpportunityFeedScalarFieldEnum = (typeof OpportunityFeedScalarFieldEnum)[keyof typeof OpportunityFeedScalarFieldEnum];
export declare const OpportunitySearchQueryScalarFieldEnum: {
    readonly opportunityId: "opportunityId";
    readonly searchQueryId: "searchQueryId";
    readonly createdAt: "createdAt";
};
export type OpportunitySearchQueryScalarFieldEnum = (typeof OpportunitySearchQueryScalarFieldEnum)[keyof typeof OpportunitySearchQueryScalarFieldEnum];
export declare const OpportunityScalarFieldEnum: {
    readonly id: "id";
    readonly opportunityFeedId: "opportunityFeedId";
    readonly externalPostId: "externalPostId";
    readonly authorUsername: "authorUsername";
    readonly text: "text";
    readonly permalink: "permalink";
    readonly publishedAt: "publishedAt";
    readonly score: "score";
    readonly reason: "reason";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type OpportunityScalarFieldEnum = (typeof OpportunityScalarFieldEnum)[keyof typeof OpportunityScalarFieldEnum];
export declare const SearchQueryScalarFieldEnum: {
    readonly id: "id";
    readonly opportunityFeedId: "opportunityFeedId";
    readonly query: "query";
    readonly type: "type";
    readonly isActive: "isActive";
    readonly matchedPosts: "matchedPosts";
    readonly relevantPosts: "relevantPosts";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SearchQueryScalarFieldEnum = (typeof SearchQueryScalarFieldEnum)[keyof typeof SearchQueryScalarFieldEnum];
export declare const ThreadsAccountScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly threadsUserId: "threadsUserId";
    readonly username: "username";
    readonly accessTokenEncrypted: "accessTokenEncrypted";
    readonly tokenExpiresAt: "tokenExpiresAt";
    readonly scopes: "scopes";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ThreadsAccountScalarFieldEnum = (typeof ThreadsAccountScalarFieldEnum)[keyof typeof ThreadsAccountScalarFieldEnum];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly age: "age";
    readonly email: "email";
    readonly passwordHash: "passwordHash";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type EnumSearchQueryTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SearchQueryType'>;
export type ListEnumSearchQueryTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SearchQueryType[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export interface PrismaClientBaseOptions {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
    queryPlanCacheMaxSize?: number;
}
export interface PrismaClientOptionsWithAccelerateUrl extends PrismaClientBaseOptions {
    accelerateUrl: string;
    adapter?: never;
}
export interface PrismaClientOptionsWithAdapter extends PrismaClientBaseOptions {
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
}
export type PrismaClientOptions = PrismaClientOptionsWithAccelerateUrl | PrismaClientOptionsWithAdapter;
export type GlobalOmitConfig = {
    opportunityFeed?: Prisma.OpportunityFeedOmit;
    opportunitySearchQuery?: Prisma.OpportunitySearchQueryOmit;
    opportunity?: Prisma.OpportunityOmit;
    searchQuery?: Prisma.SearchQueryOmit;
    threadsAccount?: Prisma.ThreadsAccountOmit;
    user?: Prisma.UserOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
