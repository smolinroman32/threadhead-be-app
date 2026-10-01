import * as runtime from "@prisma/client/runtime/client";
export const PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export const PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export const PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export const PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export const PrismaClientValidationError = runtime.PrismaClientValidationError;
export const sql = runtime.sqltag;
export const empty = runtime.empty;
export const join = runtime.join;
export const raw = runtime.raw;
export const Sql = runtime.Sql;
export const Decimal = runtime.Decimal;
export const getExtensionContext = runtime.Extensions.getExtensionContext;
export const prismaVersion = {
    client: "7.10.0",
    engine: "0edf323efd1d98336f3f0a68684b56f689b900d3"
};
export const NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
export const DbNull = runtime.DbNull;
export const JsonNull = runtime.JsonNull;
export const AnyNull = runtime.AnyNull;
export const ModelName = {
    OpportunityFeed: 'OpportunityFeed',
    OpportunitySearchQuery: 'OpportunitySearchQuery',
    Opportunity: 'Opportunity',
    SearchQuery: 'SearchQuery',
    ThreadsAccount: 'ThreadsAccount',
    User: 'User'
};
export const TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
export const OpportunityFeedScalarFieldEnum = {
    id: 'id',
    name: 'name',
    intent: 'intent',
    includeTerms: 'includeTerms',
    excludeTerms: 'excludeTerms',
    languages: 'languages',
    freshnessHours: 'freshnessHours',
    minScore: 'minScore',
    isActive: 'isActive',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const OpportunitySearchQueryScalarFieldEnum = {
    opportunityId: 'opportunityId',
    searchQueryId: 'searchQueryId',
    createdAt: 'createdAt'
};
export const OpportunityScalarFieldEnum = {
    id: 'id',
    opportunityFeedId: 'opportunityFeedId',
    externalPostId: 'externalPostId',
    authorUsername: 'authorUsername',
    text: 'text',
    permalink: 'permalink',
    publishedAt: 'publishedAt',
    score: 'score',
    reason: 'reason',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const SearchQueryScalarFieldEnum = {
    id: 'id',
    opportunityFeedId: 'opportunityFeedId',
    query: 'query',
    type: 'type',
    isActive: 'isActive',
    matchedPosts: 'matchedPosts',
    relevantPosts: 'relevantPosts',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const ThreadsAccountScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    threadsUserId: 'threadsUserId',
    username: 'username',
    accessTokenEncrypted: 'accessTokenEncrypted',
    tokenExpiresAt: 'tokenExpiresAt',
    scopes: 'scopes',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const UserScalarFieldEnum = {
    id: 'id',
    name: 'name',
    age: 'age',
    email: 'email',
    passwordHash: 'passwordHash',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
export const QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
export const defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map