import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ThreadsAccountModel = runtime.Types.Result.DefaultSelection<Prisma.$ThreadsAccountPayload>;
export type AggregateThreadsAccount = {
    _count: ThreadsAccountCountAggregateOutputType | null;
    _min: ThreadsAccountMinAggregateOutputType | null;
    _max: ThreadsAccountMaxAggregateOutputType | null;
};
export type ThreadsAccountMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    threadsUserId: string | null;
    username: string | null;
    accessTokenEncrypted: string | null;
    tokenExpiresAt: Date | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ThreadsAccountMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    threadsUserId: string | null;
    username: string | null;
    accessTokenEncrypted: string | null;
    tokenExpiresAt: Date | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ThreadsAccountCountAggregateOutputType = {
    id: number;
    userId: number;
    threadsUserId: number;
    username: number;
    accessTokenEncrypted: number;
    tokenExpiresAt: number;
    scopes: number;
    isActive: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ThreadsAccountMinAggregateInputType = {
    id?: true;
    userId?: true;
    threadsUserId?: true;
    username?: true;
    accessTokenEncrypted?: true;
    tokenExpiresAt?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ThreadsAccountMaxAggregateInputType = {
    id?: true;
    userId?: true;
    threadsUserId?: true;
    username?: true;
    accessTokenEncrypted?: true;
    tokenExpiresAt?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ThreadsAccountCountAggregateInputType = {
    id?: true;
    userId?: true;
    threadsUserId?: true;
    username?: true;
    accessTokenEncrypted?: true;
    tokenExpiresAt?: true;
    scopes?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ThreadsAccountAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ThreadsAccountWhereInput;
    orderBy?: Prisma.ThreadsAccountOrderByWithRelationInput | Prisma.ThreadsAccountOrderByWithRelationInput[];
    cursor?: Prisma.ThreadsAccountWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ThreadsAccountCountAggregateInputType;
    _min?: ThreadsAccountMinAggregateInputType;
    _max?: ThreadsAccountMaxAggregateInputType;
};
export type GetThreadsAccountAggregateType<T extends ThreadsAccountAggregateArgs> = {
    [P in keyof T & keyof AggregateThreadsAccount]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateThreadsAccount[P]> : Prisma.GetScalarType<T[P], AggregateThreadsAccount[P]>;
};
export type ThreadsAccountGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ThreadsAccountWhereInput;
    orderBy?: Prisma.ThreadsAccountOrderByWithAggregationInput | Prisma.ThreadsAccountOrderByWithAggregationInput[];
    by: Prisma.ThreadsAccountScalarFieldEnum[] | Prisma.ThreadsAccountScalarFieldEnum;
    having?: Prisma.ThreadsAccountScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ThreadsAccountCountAggregateInputType | true;
    _min?: ThreadsAccountMinAggregateInputType;
    _max?: ThreadsAccountMaxAggregateInputType;
};
export type ThreadsAccountGroupByOutputType = {
    id: string;
    userId: string;
    threadsUserId: string;
    username: string;
    accessTokenEncrypted: string;
    tokenExpiresAt: Date;
    scopes: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: ThreadsAccountCountAggregateOutputType | null;
    _min: ThreadsAccountMinAggregateOutputType | null;
    _max: ThreadsAccountMaxAggregateOutputType | null;
};
export type GetThreadsAccountGroupByPayload<T extends ThreadsAccountGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ThreadsAccountGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ThreadsAccountGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ThreadsAccountGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ThreadsAccountGroupByOutputType[P]>;
}>>;
export type ThreadsAccountWhereInput = {
    AND?: Prisma.ThreadsAccountWhereInput | Prisma.ThreadsAccountWhereInput[];
    OR?: Prisma.ThreadsAccountWhereInput[];
    NOT?: Prisma.ThreadsAccountWhereInput | Prisma.ThreadsAccountWhereInput[];
    id?: Prisma.UuidFilter<"ThreadsAccount"> | string;
    userId?: Prisma.UuidFilter<"ThreadsAccount"> | string;
    threadsUserId?: Prisma.StringFilter<"ThreadsAccount"> | string;
    username?: Prisma.StringFilter<"ThreadsAccount"> | string;
    accessTokenEncrypted?: Prisma.StringFilter<"ThreadsAccount"> | string;
    tokenExpiresAt?: Prisma.DateTimeFilter<"ThreadsAccount"> | Date | string;
    scopes?: Prisma.StringNullableListFilter<"ThreadsAccount">;
    isActive?: Prisma.BoolFilter<"ThreadsAccount"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ThreadsAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ThreadsAccount"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type ThreadsAccountOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    threadsUserId?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    accessTokenEncrypted?: Prisma.SortOrder;
    tokenExpiresAt?: Prisma.SortOrder;
    scopes?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type ThreadsAccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ThreadsAccountWhereInput | Prisma.ThreadsAccountWhereInput[];
    OR?: Prisma.ThreadsAccountWhereInput[];
    NOT?: Prisma.ThreadsAccountWhereInput | Prisma.ThreadsAccountWhereInput[];
    userId?: Prisma.UuidFilter<"ThreadsAccount"> | string;
    threadsUserId?: Prisma.StringFilter<"ThreadsAccount"> | string;
    username?: Prisma.StringFilter<"ThreadsAccount"> | string;
    accessTokenEncrypted?: Prisma.StringFilter<"ThreadsAccount"> | string;
    tokenExpiresAt?: Prisma.DateTimeFilter<"ThreadsAccount"> | Date | string;
    scopes?: Prisma.StringNullableListFilter<"ThreadsAccount">;
    isActive?: Prisma.BoolFilter<"ThreadsAccount"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ThreadsAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ThreadsAccount"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type ThreadsAccountOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    threadsUserId?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    accessTokenEncrypted?: Prisma.SortOrder;
    tokenExpiresAt?: Prisma.SortOrder;
    scopes?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ThreadsAccountCountOrderByAggregateInput;
    _max?: Prisma.ThreadsAccountMaxOrderByAggregateInput;
    _min?: Prisma.ThreadsAccountMinOrderByAggregateInput;
};
export type ThreadsAccountScalarWhereWithAggregatesInput = {
    AND?: Prisma.ThreadsAccountScalarWhereWithAggregatesInput | Prisma.ThreadsAccountScalarWhereWithAggregatesInput[];
    OR?: Prisma.ThreadsAccountScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ThreadsAccountScalarWhereWithAggregatesInput | Prisma.ThreadsAccountScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ThreadsAccount"> | string;
    userId?: Prisma.UuidWithAggregatesFilter<"ThreadsAccount"> | string;
    threadsUserId?: Prisma.StringWithAggregatesFilter<"ThreadsAccount"> | string;
    username?: Prisma.StringWithAggregatesFilter<"ThreadsAccount"> | string;
    accessTokenEncrypted?: Prisma.StringWithAggregatesFilter<"ThreadsAccount"> | string;
    tokenExpiresAt?: Prisma.DateTimeWithAggregatesFilter<"ThreadsAccount"> | Date | string;
    scopes?: Prisma.StringNullableListFilter<"ThreadsAccount">;
    isActive?: Prisma.BoolWithAggregatesFilter<"ThreadsAccount"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ThreadsAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ThreadsAccount"> | Date | string;
};
export type ThreadsAccountCreateInput = {
    id?: string;
    threadsUserId: string;
    username: string;
    accessTokenEncrypted: string;
    tokenExpiresAt: Date | string;
    scopes?: Prisma.ThreadsAccountCreatescopesInput | string[];
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutThreadsAccountsInput;
};
export type ThreadsAccountUncheckedCreateInput = {
    id?: string;
    userId: string;
    threadsUserId: string;
    username: string;
    accessTokenEncrypted: string;
    tokenExpiresAt: Date | string;
    scopes?: Prisma.ThreadsAccountCreatescopesInput | string[];
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ThreadsAccountUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    threadsUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.StringFieldUpdateOperationsInput | string;
    accessTokenEncrypted?: Prisma.StringFieldUpdateOperationsInput | string;
    tokenExpiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scopes?: Prisma.ThreadsAccountUpdatescopesInput | string[];
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutThreadsAccountsNestedInput;
};
export type ThreadsAccountUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    threadsUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.StringFieldUpdateOperationsInput | string;
    accessTokenEncrypted?: Prisma.StringFieldUpdateOperationsInput | string;
    tokenExpiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scopes?: Prisma.ThreadsAccountUpdatescopesInput | string[];
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ThreadsAccountCreateManyInput = {
    id?: string;
    userId: string;
    threadsUserId: string;
    username: string;
    accessTokenEncrypted: string;
    tokenExpiresAt: Date | string;
    scopes?: Prisma.ThreadsAccountCreatescopesInput | string[];
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ThreadsAccountUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    threadsUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.StringFieldUpdateOperationsInput | string;
    accessTokenEncrypted?: Prisma.StringFieldUpdateOperationsInput | string;
    tokenExpiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scopes?: Prisma.ThreadsAccountUpdatescopesInput | string[];
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ThreadsAccountUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    threadsUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.StringFieldUpdateOperationsInput | string;
    accessTokenEncrypted?: Prisma.StringFieldUpdateOperationsInput | string;
    tokenExpiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scopes?: Prisma.ThreadsAccountUpdatescopesInput | string[];
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ThreadsAccountCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    threadsUserId?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    accessTokenEncrypted?: Prisma.SortOrder;
    tokenExpiresAt?: Prisma.SortOrder;
    scopes?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ThreadsAccountMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    threadsUserId?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    accessTokenEncrypted?: Prisma.SortOrder;
    tokenExpiresAt?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ThreadsAccountMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    threadsUserId?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    accessTokenEncrypted?: Prisma.SortOrder;
    tokenExpiresAt?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ThreadsAccountListRelationFilter = {
    every?: Prisma.ThreadsAccountWhereInput;
    some?: Prisma.ThreadsAccountWhereInput;
    none?: Prisma.ThreadsAccountWhereInput;
};
export type ThreadsAccountOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ThreadsAccountCreatescopesInput = {
    set: string[];
};
export type ThreadsAccountUpdatescopesInput = {
    set?: string[];
    push?: string | string[];
};
export type ThreadsAccountCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ThreadsAccountCreateWithoutUserInput, Prisma.ThreadsAccountUncheckedCreateWithoutUserInput> | Prisma.ThreadsAccountCreateWithoutUserInput[] | Prisma.ThreadsAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ThreadsAccountCreateOrConnectWithoutUserInput | Prisma.ThreadsAccountCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ThreadsAccountCreateManyUserInputEnvelope;
    connect?: Prisma.ThreadsAccountWhereUniqueInput | Prisma.ThreadsAccountWhereUniqueInput[];
};
export type ThreadsAccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ThreadsAccountCreateWithoutUserInput, Prisma.ThreadsAccountUncheckedCreateWithoutUserInput> | Prisma.ThreadsAccountCreateWithoutUserInput[] | Prisma.ThreadsAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ThreadsAccountCreateOrConnectWithoutUserInput | Prisma.ThreadsAccountCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ThreadsAccountCreateManyUserInputEnvelope;
    connect?: Prisma.ThreadsAccountWhereUniqueInput | Prisma.ThreadsAccountWhereUniqueInput[];
};
export type ThreadsAccountUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ThreadsAccountCreateWithoutUserInput, Prisma.ThreadsAccountUncheckedCreateWithoutUserInput> | Prisma.ThreadsAccountCreateWithoutUserInput[] | Prisma.ThreadsAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ThreadsAccountCreateOrConnectWithoutUserInput | Prisma.ThreadsAccountCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ThreadsAccountUpsertWithWhereUniqueWithoutUserInput | Prisma.ThreadsAccountUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ThreadsAccountCreateManyUserInputEnvelope;
    set?: Prisma.ThreadsAccountWhereUniqueInput | Prisma.ThreadsAccountWhereUniqueInput[];
    disconnect?: Prisma.ThreadsAccountWhereUniqueInput | Prisma.ThreadsAccountWhereUniqueInput[];
    delete?: Prisma.ThreadsAccountWhereUniqueInput | Prisma.ThreadsAccountWhereUniqueInput[];
    connect?: Prisma.ThreadsAccountWhereUniqueInput | Prisma.ThreadsAccountWhereUniqueInput[];
    update?: Prisma.ThreadsAccountUpdateWithWhereUniqueWithoutUserInput | Prisma.ThreadsAccountUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ThreadsAccountUpdateManyWithWhereWithoutUserInput | Prisma.ThreadsAccountUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ThreadsAccountScalarWhereInput | Prisma.ThreadsAccountScalarWhereInput[];
};
export type ThreadsAccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ThreadsAccountCreateWithoutUserInput, Prisma.ThreadsAccountUncheckedCreateWithoutUserInput> | Prisma.ThreadsAccountCreateWithoutUserInput[] | Prisma.ThreadsAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ThreadsAccountCreateOrConnectWithoutUserInput | Prisma.ThreadsAccountCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ThreadsAccountUpsertWithWhereUniqueWithoutUserInput | Prisma.ThreadsAccountUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ThreadsAccountCreateManyUserInputEnvelope;
    set?: Prisma.ThreadsAccountWhereUniqueInput | Prisma.ThreadsAccountWhereUniqueInput[];
    disconnect?: Prisma.ThreadsAccountWhereUniqueInput | Prisma.ThreadsAccountWhereUniqueInput[];
    delete?: Prisma.ThreadsAccountWhereUniqueInput | Prisma.ThreadsAccountWhereUniqueInput[];
    connect?: Prisma.ThreadsAccountWhereUniqueInput | Prisma.ThreadsAccountWhereUniqueInput[];
    update?: Prisma.ThreadsAccountUpdateWithWhereUniqueWithoutUserInput | Prisma.ThreadsAccountUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ThreadsAccountUpdateManyWithWhereWithoutUserInput | Prisma.ThreadsAccountUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ThreadsAccountScalarWhereInput | Prisma.ThreadsAccountScalarWhereInput[];
};
export type ThreadsAccountCreateWithoutUserInput = {
    id?: string;
    threadsUserId: string;
    username: string;
    accessTokenEncrypted: string;
    tokenExpiresAt: Date | string;
    scopes?: Prisma.ThreadsAccountCreatescopesInput | string[];
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ThreadsAccountUncheckedCreateWithoutUserInput = {
    id?: string;
    threadsUserId: string;
    username: string;
    accessTokenEncrypted: string;
    tokenExpiresAt: Date | string;
    scopes?: Prisma.ThreadsAccountCreatescopesInput | string[];
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ThreadsAccountCreateOrConnectWithoutUserInput = {
    where: Prisma.ThreadsAccountWhereUniqueInput;
    create: Prisma.XOR<Prisma.ThreadsAccountCreateWithoutUserInput, Prisma.ThreadsAccountUncheckedCreateWithoutUserInput>;
};
export type ThreadsAccountCreateManyUserInputEnvelope = {
    data: Prisma.ThreadsAccountCreateManyUserInput | Prisma.ThreadsAccountCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type ThreadsAccountUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.ThreadsAccountWhereUniqueInput;
    update: Prisma.XOR<Prisma.ThreadsAccountUpdateWithoutUserInput, Prisma.ThreadsAccountUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.ThreadsAccountCreateWithoutUserInput, Prisma.ThreadsAccountUncheckedCreateWithoutUserInput>;
};
export type ThreadsAccountUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.ThreadsAccountWhereUniqueInput;
    data: Prisma.XOR<Prisma.ThreadsAccountUpdateWithoutUserInput, Prisma.ThreadsAccountUncheckedUpdateWithoutUserInput>;
};
export type ThreadsAccountUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.ThreadsAccountScalarWhereInput;
    data: Prisma.XOR<Prisma.ThreadsAccountUpdateManyMutationInput, Prisma.ThreadsAccountUncheckedUpdateManyWithoutUserInput>;
};
export type ThreadsAccountScalarWhereInput = {
    AND?: Prisma.ThreadsAccountScalarWhereInput | Prisma.ThreadsAccountScalarWhereInput[];
    OR?: Prisma.ThreadsAccountScalarWhereInput[];
    NOT?: Prisma.ThreadsAccountScalarWhereInput | Prisma.ThreadsAccountScalarWhereInput[];
    id?: Prisma.UuidFilter<"ThreadsAccount"> | string;
    userId?: Prisma.UuidFilter<"ThreadsAccount"> | string;
    threadsUserId?: Prisma.StringFilter<"ThreadsAccount"> | string;
    username?: Prisma.StringFilter<"ThreadsAccount"> | string;
    accessTokenEncrypted?: Prisma.StringFilter<"ThreadsAccount"> | string;
    tokenExpiresAt?: Prisma.DateTimeFilter<"ThreadsAccount"> | Date | string;
    scopes?: Prisma.StringNullableListFilter<"ThreadsAccount">;
    isActive?: Prisma.BoolFilter<"ThreadsAccount"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ThreadsAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ThreadsAccount"> | Date | string;
};
export type ThreadsAccountCreateManyUserInput = {
    id?: string;
    threadsUserId: string;
    username: string;
    accessTokenEncrypted: string;
    tokenExpiresAt: Date | string;
    scopes?: Prisma.ThreadsAccountCreatescopesInput | string[];
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ThreadsAccountUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    threadsUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.StringFieldUpdateOperationsInput | string;
    accessTokenEncrypted?: Prisma.StringFieldUpdateOperationsInput | string;
    tokenExpiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scopes?: Prisma.ThreadsAccountUpdatescopesInput | string[];
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ThreadsAccountUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    threadsUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.StringFieldUpdateOperationsInput | string;
    accessTokenEncrypted?: Prisma.StringFieldUpdateOperationsInput | string;
    tokenExpiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scopes?: Prisma.ThreadsAccountUpdatescopesInput | string[];
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ThreadsAccountUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    threadsUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.StringFieldUpdateOperationsInput | string;
    accessTokenEncrypted?: Prisma.StringFieldUpdateOperationsInput | string;
    tokenExpiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scopes?: Prisma.ThreadsAccountUpdatescopesInput | string[];
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ThreadsAccountSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    threadsUserId?: boolean;
    username?: boolean;
    accessTokenEncrypted?: boolean;
    tokenExpiresAt?: boolean;
    scopes?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["threadsAccount"]>;
export type ThreadsAccountSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    threadsUserId?: boolean;
    username?: boolean;
    accessTokenEncrypted?: boolean;
    tokenExpiresAt?: boolean;
    scopes?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["threadsAccount"]>;
export type ThreadsAccountSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    threadsUserId?: boolean;
    username?: boolean;
    accessTokenEncrypted?: boolean;
    tokenExpiresAt?: boolean;
    scopes?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["threadsAccount"]>;
export type ThreadsAccountSelectScalar = {
    id?: boolean;
    userId?: boolean;
    threadsUserId?: boolean;
    username?: boolean;
    accessTokenEncrypted?: boolean;
    tokenExpiresAt?: boolean;
    scopes?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ThreadsAccountOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "threadsUserId" | "username" | "accessTokenEncrypted" | "tokenExpiresAt" | "scopes" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["threadsAccount"]>;
export type ThreadsAccountInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ThreadsAccountIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ThreadsAccountIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $ThreadsAccountPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ThreadsAccount";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        threadsUserId: string;
        username: string;
        accessTokenEncrypted: string;
        tokenExpiresAt: Date;
        scopes: string[];
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["threadsAccount"]>;
    composites: {};
};
export type ThreadsAccountGetPayload<S extends boolean | null | undefined | ThreadsAccountDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload, S>;
export type ThreadsAccountCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ThreadsAccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ThreadsAccountCountAggregateInputType | true;
};
export interface ThreadsAccountDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ThreadsAccount'];
        meta: {
            name: 'ThreadsAccount';
        };
    };
    findUnique<T extends ThreadsAccountFindUniqueArgs>(args: Prisma.SelectSubset<T, ThreadsAccountFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ThreadsAccountClient<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ThreadsAccountFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ThreadsAccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ThreadsAccountClient<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ThreadsAccountFindFirstArgs>(args?: Prisma.SelectSubset<T, ThreadsAccountFindFirstArgs<ExtArgs>>): Prisma.Prisma__ThreadsAccountClient<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ThreadsAccountFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ThreadsAccountFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ThreadsAccountClient<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ThreadsAccountFindManyArgs>(args?: Prisma.SelectSubset<T, ThreadsAccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ThreadsAccountCreateArgs>(args: Prisma.SelectSubset<T, ThreadsAccountCreateArgs<ExtArgs>>): Prisma.Prisma__ThreadsAccountClient<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ThreadsAccountCreateManyArgs>(args?: Prisma.SelectSubset<T, ThreadsAccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ThreadsAccountCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ThreadsAccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ThreadsAccountDeleteArgs>(args: Prisma.SelectSubset<T, ThreadsAccountDeleteArgs<ExtArgs>>): Prisma.Prisma__ThreadsAccountClient<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ThreadsAccountUpdateArgs>(args: Prisma.SelectSubset<T, ThreadsAccountUpdateArgs<ExtArgs>>): Prisma.Prisma__ThreadsAccountClient<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ThreadsAccountDeleteManyArgs>(args?: Prisma.SelectSubset<T, ThreadsAccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ThreadsAccountUpdateManyArgs>(args: Prisma.SelectSubset<T, ThreadsAccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ThreadsAccountUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ThreadsAccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ThreadsAccountUpsertArgs>(args: Prisma.SelectSubset<T, ThreadsAccountUpsertArgs<ExtArgs>>): Prisma.Prisma__ThreadsAccountClient<runtime.Types.Result.GetResult<Prisma.$ThreadsAccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ThreadsAccountCountArgs>(args?: Prisma.Subset<T, ThreadsAccountCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ThreadsAccountCountAggregateOutputType> : number>;
    aggregate<T extends ThreadsAccountAggregateArgs>(args: Prisma.Subset<T, ThreadsAccountAggregateArgs>): Prisma.PrismaPromise<GetThreadsAccountAggregateType<T>>;
    groupBy<T extends ThreadsAccountGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ThreadsAccountGroupByArgs['orderBy'];
    } : {
        orderBy?: ThreadsAccountGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ThreadsAccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetThreadsAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ThreadsAccountFieldRefs;
}
export interface Prisma__ThreadsAccountClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ThreadsAccountFieldRefs {
    readonly id: Prisma.FieldRef<"ThreadsAccount", 'String'>;
    readonly userId: Prisma.FieldRef<"ThreadsAccount", 'String'>;
    readonly threadsUserId: Prisma.FieldRef<"ThreadsAccount", 'String'>;
    readonly username: Prisma.FieldRef<"ThreadsAccount", 'String'>;
    readonly accessTokenEncrypted: Prisma.FieldRef<"ThreadsAccount", 'String'>;
    readonly tokenExpiresAt: Prisma.FieldRef<"ThreadsAccount", 'DateTime'>;
    readonly scopes: Prisma.FieldRef<"ThreadsAccount", 'String[]'>;
    readonly isActive: Prisma.FieldRef<"ThreadsAccount", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"ThreadsAccount", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ThreadsAccount", 'DateTime'>;
}
export type ThreadsAccountFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelect<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    include?: Prisma.ThreadsAccountInclude<ExtArgs> | null;
    where: Prisma.ThreadsAccountWhereUniqueInput;
};
export type ThreadsAccountFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelect<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    include?: Prisma.ThreadsAccountInclude<ExtArgs> | null;
    where: Prisma.ThreadsAccountWhereUniqueInput;
};
export type ThreadsAccountFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelect<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    include?: Prisma.ThreadsAccountInclude<ExtArgs> | null;
    where?: Prisma.ThreadsAccountWhereInput;
    orderBy?: Prisma.ThreadsAccountOrderByWithRelationInput | Prisma.ThreadsAccountOrderByWithRelationInput[];
    cursor?: Prisma.ThreadsAccountWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ThreadsAccountScalarFieldEnum | Prisma.ThreadsAccountScalarFieldEnum[];
};
export type ThreadsAccountFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelect<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    include?: Prisma.ThreadsAccountInclude<ExtArgs> | null;
    where?: Prisma.ThreadsAccountWhereInput;
    orderBy?: Prisma.ThreadsAccountOrderByWithRelationInput | Prisma.ThreadsAccountOrderByWithRelationInput[];
    cursor?: Prisma.ThreadsAccountWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ThreadsAccountScalarFieldEnum | Prisma.ThreadsAccountScalarFieldEnum[];
};
export type ThreadsAccountFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelect<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    include?: Prisma.ThreadsAccountInclude<ExtArgs> | null;
    where?: Prisma.ThreadsAccountWhereInput;
    orderBy?: Prisma.ThreadsAccountOrderByWithRelationInput | Prisma.ThreadsAccountOrderByWithRelationInput[];
    cursor?: Prisma.ThreadsAccountWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ThreadsAccountScalarFieldEnum | Prisma.ThreadsAccountScalarFieldEnum[];
};
export type ThreadsAccountCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelect<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    include?: Prisma.ThreadsAccountInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ThreadsAccountCreateInput, Prisma.ThreadsAccountUncheckedCreateInput>;
};
export type ThreadsAccountCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ThreadsAccountCreateManyInput | Prisma.ThreadsAccountCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ThreadsAccountCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    data: Prisma.ThreadsAccountCreateManyInput | Prisma.ThreadsAccountCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ThreadsAccountIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ThreadsAccountUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelect<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    include?: Prisma.ThreadsAccountInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ThreadsAccountUpdateInput, Prisma.ThreadsAccountUncheckedUpdateInput>;
    where: Prisma.ThreadsAccountWhereUniqueInput;
};
export type ThreadsAccountUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ThreadsAccountUpdateManyMutationInput, Prisma.ThreadsAccountUncheckedUpdateManyInput>;
    where?: Prisma.ThreadsAccountWhereInput;
    limit?: number;
};
export type ThreadsAccountUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ThreadsAccountUpdateManyMutationInput, Prisma.ThreadsAccountUncheckedUpdateManyInput>;
    where?: Prisma.ThreadsAccountWhereInput;
    limit?: number;
    include?: Prisma.ThreadsAccountIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ThreadsAccountUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelect<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    include?: Prisma.ThreadsAccountInclude<ExtArgs> | null;
    where: Prisma.ThreadsAccountWhereUniqueInput;
    create: Prisma.XOR<Prisma.ThreadsAccountCreateInput, Prisma.ThreadsAccountUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ThreadsAccountUpdateInput, Prisma.ThreadsAccountUncheckedUpdateInput>;
};
export type ThreadsAccountDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelect<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    include?: Prisma.ThreadsAccountInclude<ExtArgs> | null;
    where: Prisma.ThreadsAccountWhereUniqueInput;
};
export type ThreadsAccountDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ThreadsAccountWhereInput;
    limit?: number;
};
export type ThreadsAccountDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ThreadsAccountSelect<ExtArgs> | null;
    omit?: Prisma.ThreadsAccountOmit<ExtArgs> | null;
    include?: Prisma.ThreadsAccountInclude<ExtArgs> | null;
};
