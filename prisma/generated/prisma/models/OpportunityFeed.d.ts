import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type OpportunityFeedModel = runtime.Types.Result.DefaultSelection<Prisma.$OpportunityFeedPayload>;
export type AggregateOpportunityFeed = {
    _count: OpportunityFeedCountAggregateOutputType | null;
    _avg: OpportunityFeedAvgAggregateOutputType | null;
    _sum: OpportunityFeedSumAggregateOutputType | null;
    _min: OpportunityFeedMinAggregateOutputType | null;
    _max: OpportunityFeedMaxAggregateOutputType | null;
};
export type OpportunityFeedAvgAggregateOutputType = {
    freshnessHours: number | null;
    minScore: number | null;
};
export type OpportunityFeedSumAggregateOutputType = {
    freshnessHours: number | null;
    minScore: number | null;
};
export type OpportunityFeedMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    intent: string | null;
    freshnessHours: number | null;
    minScore: number | null;
    isActive: boolean | null;
    userId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type OpportunityFeedMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    intent: string | null;
    freshnessHours: number | null;
    minScore: number | null;
    isActive: boolean | null;
    userId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type OpportunityFeedCountAggregateOutputType = {
    id: number;
    name: number;
    intent: number;
    includeTerms: number;
    excludeTerms: number;
    languages: number;
    freshnessHours: number;
    minScore: number;
    isActive: number;
    userId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type OpportunityFeedAvgAggregateInputType = {
    freshnessHours?: true;
    minScore?: true;
};
export type OpportunityFeedSumAggregateInputType = {
    freshnessHours?: true;
    minScore?: true;
};
export type OpportunityFeedMinAggregateInputType = {
    id?: true;
    name?: true;
    intent?: true;
    freshnessHours?: true;
    minScore?: true;
    isActive?: true;
    userId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type OpportunityFeedMaxAggregateInputType = {
    id?: true;
    name?: true;
    intent?: true;
    freshnessHours?: true;
    minScore?: true;
    isActive?: true;
    userId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type OpportunityFeedCountAggregateInputType = {
    id?: true;
    name?: true;
    intent?: true;
    includeTerms?: true;
    excludeTerms?: true;
    languages?: true;
    freshnessHours?: true;
    minScore?: true;
    isActive?: true;
    userId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type OpportunityFeedAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunityFeedWhereInput;
    orderBy?: Prisma.OpportunityFeedOrderByWithRelationInput | Prisma.OpportunityFeedOrderByWithRelationInput[];
    cursor?: Prisma.OpportunityFeedWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | OpportunityFeedCountAggregateInputType;
    _avg?: OpportunityFeedAvgAggregateInputType;
    _sum?: OpportunityFeedSumAggregateInputType;
    _min?: OpportunityFeedMinAggregateInputType;
    _max?: OpportunityFeedMaxAggregateInputType;
};
export type GetOpportunityFeedAggregateType<T extends OpportunityFeedAggregateArgs> = {
    [P in keyof T & keyof AggregateOpportunityFeed]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateOpportunityFeed[P]> : Prisma.GetScalarType<T[P], AggregateOpportunityFeed[P]>;
};
export type OpportunityFeedGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunityFeedWhereInput;
    orderBy?: Prisma.OpportunityFeedOrderByWithAggregationInput | Prisma.OpportunityFeedOrderByWithAggregationInput[];
    by: Prisma.OpportunityFeedScalarFieldEnum[] | Prisma.OpportunityFeedScalarFieldEnum;
    having?: Prisma.OpportunityFeedScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OpportunityFeedCountAggregateInputType | true;
    _avg?: OpportunityFeedAvgAggregateInputType;
    _sum?: OpportunityFeedSumAggregateInputType;
    _min?: OpportunityFeedMinAggregateInputType;
    _max?: OpportunityFeedMaxAggregateInputType;
};
export type OpportunityFeedGroupByOutputType = {
    id: string;
    name: string;
    intent: string;
    includeTerms: string[];
    excludeTerms: string[];
    languages: string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: OpportunityFeedCountAggregateOutputType | null;
    _avg: OpportunityFeedAvgAggregateOutputType | null;
    _sum: OpportunityFeedSumAggregateOutputType | null;
    _min: OpportunityFeedMinAggregateOutputType | null;
    _max: OpportunityFeedMaxAggregateOutputType | null;
};
export type GetOpportunityFeedGroupByPayload<T extends OpportunityFeedGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<OpportunityFeedGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof OpportunityFeedGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], OpportunityFeedGroupByOutputType[P]> : Prisma.GetScalarType<T[P], OpportunityFeedGroupByOutputType[P]>;
}>>;
export type OpportunityFeedWhereInput = {
    AND?: Prisma.OpportunityFeedWhereInput | Prisma.OpportunityFeedWhereInput[];
    OR?: Prisma.OpportunityFeedWhereInput[];
    NOT?: Prisma.OpportunityFeedWhereInput | Prisma.OpportunityFeedWhereInput[];
    id?: Prisma.UuidFilter<"OpportunityFeed"> | string;
    name?: Prisma.StringFilter<"OpportunityFeed"> | string;
    intent?: Prisma.StringFilter<"OpportunityFeed"> | string;
    includeTerms?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    excludeTerms?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    languages?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    freshnessHours?: Prisma.IntFilter<"OpportunityFeed"> | number;
    minScore?: Prisma.IntFilter<"OpportunityFeed"> | number;
    isActive?: Prisma.BoolFilter<"OpportunityFeed"> | boolean;
    userId?: Prisma.UuidFilter<"OpportunityFeed"> | string;
    createdAt?: Prisma.DateTimeFilter<"OpportunityFeed"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"OpportunityFeed"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    searchQueries?: Prisma.SearchQueryListRelationFilter;
    opportunities?: Prisma.OpportunityListRelationFilter;
};
export type OpportunityFeedOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    intent?: Prisma.SortOrder;
    includeTerms?: Prisma.SortOrder;
    excludeTerms?: Prisma.SortOrder;
    languages?: Prisma.SortOrder;
    freshnessHours?: Prisma.SortOrder;
    minScore?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    searchQueries?: Prisma.SearchQueryOrderByRelationAggregateInput;
    opportunities?: Prisma.OpportunityOrderByRelationAggregateInput;
};
export type OpportunityFeedWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.OpportunityFeedWhereInput | Prisma.OpportunityFeedWhereInput[];
    OR?: Prisma.OpportunityFeedWhereInput[];
    NOT?: Prisma.OpportunityFeedWhereInput | Prisma.OpportunityFeedWhereInput[];
    name?: Prisma.StringFilter<"OpportunityFeed"> | string;
    intent?: Prisma.StringFilter<"OpportunityFeed"> | string;
    includeTerms?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    excludeTerms?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    languages?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    freshnessHours?: Prisma.IntFilter<"OpportunityFeed"> | number;
    minScore?: Prisma.IntFilter<"OpportunityFeed"> | number;
    isActive?: Prisma.BoolFilter<"OpportunityFeed"> | boolean;
    userId?: Prisma.UuidFilter<"OpportunityFeed"> | string;
    createdAt?: Prisma.DateTimeFilter<"OpportunityFeed"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"OpportunityFeed"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    searchQueries?: Prisma.SearchQueryListRelationFilter;
    opportunities?: Prisma.OpportunityListRelationFilter;
}, "id">;
export type OpportunityFeedOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    intent?: Prisma.SortOrder;
    includeTerms?: Prisma.SortOrder;
    excludeTerms?: Prisma.SortOrder;
    languages?: Prisma.SortOrder;
    freshnessHours?: Prisma.SortOrder;
    minScore?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.OpportunityFeedCountOrderByAggregateInput;
    _avg?: Prisma.OpportunityFeedAvgOrderByAggregateInput;
    _max?: Prisma.OpportunityFeedMaxOrderByAggregateInput;
    _min?: Prisma.OpportunityFeedMinOrderByAggregateInput;
    _sum?: Prisma.OpportunityFeedSumOrderByAggregateInput;
};
export type OpportunityFeedScalarWhereWithAggregatesInput = {
    AND?: Prisma.OpportunityFeedScalarWhereWithAggregatesInput | Prisma.OpportunityFeedScalarWhereWithAggregatesInput[];
    OR?: Prisma.OpportunityFeedScalarWhereWithAggregatesInput[];
    NOT?: Prisma.OpportunityFeedScalarWhereWithAggregatesInput | Prisma.OpportunityFeedScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"OpportunityFeed"> | string;
    name?: Prisma.StringWithAggregatesFilter<"OpportunityFeed"> | string;
    intent?: Prisma.StringWithAggregatesFilter<"OpportunityFeed"> | string;
    includeTerms?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    excludeTerms?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    languages?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    freshnessHours?: Prisma.IntWithAggregatesFilter<"OpportunityFeed"> | number;
    minScore?: Prisma.IntWithAggregatesFilter<"OpportunityFeed"> | number;
    isActive?: Prisma.BoolWithAggregatesFilter<"OpportunityFeed"> | boolean;
    userId?: Prisma.UuidWithAggregatesFilter<"OpportunityFeed"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"OpportunityFeed"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"OpportunityFeed"> | Date | string;
};
export type OpportunityFeedCreateInput = {
    id?: string;
    name: string;
    intent: string;
    includeTerms?: Prisma.OpportunityFeedCreateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedCreateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedCreatelanguagesInput | string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutOpportunityFeedsInput;
    searchQueries?: Prisma.SearchQueryCreateNestedManyWithoutOpportunityFeedInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutOpportunityFeedInput;
};
export type OpportunityFeedUncheckedCreateInput = {
    id?: string;
    name: string;
    intent: string;
    includeTerms?: Prisma.OpportunityFeedCreateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedCreateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedCreatelanguagesInput | string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    searchQueries?: Prisma.SearchQueryUncheckedCreateNestedManyWithoutOpportunityFeedInput;
    opportunities?: Prisma.OpportunityUncheckedCreateNestedManyWithoutOpportunityFeedInput;
};
export type OpportunityFeedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutOpportunityFeedsNestedInput;
    searchQueries?: Prisma.SearchQueryUpdateManyWithoutOpportunityFeedNestedInput;
    opportunities?: Prisma.OpportunityUpdateManyWithoutOpportunityFeedNestedInput;
};
export type OpportunityFeedUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    searchQueries?: Prisma.SearchQueryUncheckedUpdateManyWithoutOpportunityFeedNestedInput;
    opportunities?: Prisma.OpportunityUncheckedUpdateManyWithoutOpportunityFeedNestedInput;
};
export type OpportunityFeedCreateManyInput = {
    id?: string;
    name: string;
    intent: string;
    includeTerms?: Prisma.OpportunityFeedCreateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedCreateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedCreatelanguagesInput | string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type OpportunityFeedUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunityFeedUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type OpportunityFeedCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    intent?: Prisma.SortOrder;
    includeTerms?: Prisma.SortOrder;
    excludeTerms?: Prisma.SortOrder;
    languages?: Prisma.SortOrder;
    freshnessHours?: Prisma.SortOrder;
    minScore?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type OpportunityFeedAvgOrderByAggregateInput = {
    freshnessHours?: Prisma.SortOrder;
    minScore?: Prisma.SortOrder;
};
export type OpportunityFeedMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    intent?: Prisma.SortOrder;
    freshnessHours?: Prisma.SortOrder;
    minScore?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type OpportunityFeedMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    intent?: Prisma.SortOrder;
    freshnessHours?: Prisma.SortOrder;
    minScore?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type OpportunityFeedSumOrderByAggregateInput = {
    freshnessHours?: Prisma.SortOrder;
    minScore?: Prisma.SortOrder;
};
export type OpportunityFeedScalarRelationFilter = {
    is?: Prisma.OpportunityFeedWhereInput;
    isNot?: Prisma.OpportunityFeedWhereInput;
};
export type OpportunityFeedListRelationFilter = {
    every?: Prisma.OpportunityFeedWhereInput;
    some?: Prisma.OpportunityFeedWhereInput;
    none?: Prisma.OpportunityFeedWhereInput;
};
export type OpportunityFeedOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type OpportunityFeedCreateincludeTermsInput = {
    set: string[];
};
export type OpportunityFeedCreateexcludeTermsInput = {
    set: string[];
};
export type OpportunityFeedCreatelanguagesInput = {
    set: string[];
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type OpportunityFeedUpdateincludeTermsInput = {
    set?: string[];
    push?: string | string[];
};
export type OpportunityFeedUpdateexcludeTermsInput = {
    set?: string[];
    push?: string | string[];
};
export type OpportunityFeedUpdatelanguagesInput = {
    set?: string[];
    push?: string | string[];
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type OpportunityFeedCreateNestedOneWithoutOpportunitiesInput = {
    create?: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutOpportunitiesInput, Prisma.OpportunityFeedUncheckedCreateWithoutOpportunitiesInput>;
    connectOrCreate?: Prisma.OpportunityFeedCreateOrConnectWithoutOpportunitiesInput;
    connect?: Prisma.OpportunityFeedWhereUniqueInput;
};
export type OpportunityFeedUpdateOneRequiredWithoutOpportunitiesNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutOpportunitiesInput, Prisma.OpportunityFeedUncheckedCreateWithoutOpportunitiesInput>;
    connectOrCreate?: Prisma.OpportunityFeedCreateOrConnectWithoutOpportunitiesInput;
    upsert?: Prisma.OpportunityFeedUpsertWithoutOpportunitiesInput;
    connect?: Prisma.OpportunityFeedWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OpportunityFeedUpdateToOneWithWhereWithoutOpportunitiesInput, Prisma.OpportunityFeedUpdateWithoutOpportunitiesInput>, Prisma.OpportunityFeedUncheckedUpdateWithoutOpportunitiesInput>;
};
export type OpportunityFeedCreateNestedOneWithoutSearchQueriesInput = {
    create?: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutSearchQueriesInput, Prisma.OpportunityFeedUncheckedCreateWithoutSearchQueriesInput>;
    connectOrCreate?: Prisma.OpportunityFeedCreateOrConnectWithoutSearchQueriesInput;
    connect?: Prisma.OpportunityFeedWhereUniqueInput;
};
export type OpportunityFeedUpdateOneRequiredWithoutSearchQueriesNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutSearchQueriesInput, Prisma.OpportunityFeedUncheckedCreateWithoutSearchQueriesInput>;
    connectOrCreate?: Prisma.OpportunityFeedCreateOrConnectWithoutSearchQueriesInput;
    upsert?: Prisma.OpportunityFeedUpsertWithoutSearchQueriesInput;
    connect?: Prisma.OpportunityFeedWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OpportunityFeedUpdateToOneWithWhereWithoutSearchQueriesInput, Prisma.OpportunityFeedUpdateWithoutSearchQueriesInput>, Prisma.OpportunityFeedUncheckedUpdateWithoutSearchQueriesInput>;
};
export type OpportunityFeedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutUserInput, Prisma.OpportunityFeedUncheckedCreateWithoutUserInput> | Prisma.OpportunityFeedCreateWithoutUserInput[] | Prisma.OpportunityFeedUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.OpportunityFeedCreateOrConnectWithoutUserInput | Prisma.OpportunityFeedCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.OpportunityFeedCreateManyUserInputEnvelope;
    connect?: Prisma.OpportunityFeedWhereUniqueInput | Prisma.OpportunityFeedWhereUniqueInput[];
};
export type OpportunityFeedUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutUserInput, Prisma.OpportunityFeedUncheckedCreateWithoutUserInput> | Prisma.OpportunityFeedCreateWithoutUserInput[] | Prisma.OpportunityFeedUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.OpportunityFeedCreateOrConnectWithoutUserInput | Prisma.OpportunityFeedCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.OpportunityFeedCreateManyUserInputEnvelope;
    connect?: Prisma.OpportunityFeedWhereUniqueInput | Prisma.OpportunityFeedWhereUniqueInput[];
};
export type OpportunityFeedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutUserInput, Prisma.OpportunityFeedUncheckedCreateWithoutUserInput> | Prisma.OpportunityFeedCreateWithoutUserInput[] | Prisma.OpportunityFeedUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.OpportunityFeedCreateOrConnectWithoutUserInput | Prisma.OpportunityFeedCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.OpportunityFeedUpsertWithWhereUniqueWithoutUserInput | Prisma.OpportunityFeedUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.OpportunityFeedCreateManyUserInputEnvelope;
    set?: Prisma.OpportunityFeedWhereUniqueInput | Prisma.OpportunityFeedWhereUniqueInput[];
    disconnect?: Prisma.OpportunityFeedWhereUniqueInput | Prisma.OpportunityFeedWhereUniqueInput[];
    delete?: Prisma.OpportunityFeedWhereUniqueInput | Prisma.OpportunityFeedWhereUniqueInput[];
    connect?: Prisma.OpportunityFeedWhereUniqueInput | Prisma.OpportunityFeedWhereUniqueInput[];
    update?: Prisma.OpportunityFeedUpdateWithWhereUniqueWithoutUserInput | Prisma.OpportunityFeedUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.OpportunityFeedUpdateManyWithWhereWithoutUserInput | Prisma.OpportunityFeedUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.OpportunityFeedScalarWhereInput | Prisma.OpportunityFeedScalarWhereInput[];
};
export type OpportunityFeedUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutUserInput, Prisma.OpportunityFeedUncheckedCreateWithoutUserInput> | Prisma.OpportunityFeedCreateWithoutUserInput[] | Prisma.OpportunityFeedUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.OpportunityFeedCreateOrConnectWithoutUserInput | Prisma.OpportunityFeedCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.OpportunityFeedUpsertWithWhereUniqueWithoutUserInput | Prisma.OpportunityFeedUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.OpportunityFeedCreateManyUserInputEnvelope;
    set?: Prisma.OpportunityFeedWhereUniqueInput | Prisma.OpportunityFeedWhereUniqueInput[];
    disconnect?: Prisma.OpportunityFeedWhereUniqueInput | Prisma.OpportunityFeedWhereUniqueInput[];
    delete?: Prisma.OpportunityFeedWhereUniqueInput | Prisma.OpportunityFeedWhereUniqueInput[];
    connect?: Prisma.OpportunityFeedWhereUniqueInput | Prisma.OpportunityFeedWhereUniqueInput[];
    update?: Prisma.OpportunityFeedUpdateWithWhereUniqueWithoutUserInput | Prisma.OpportunityFeedUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.OpportunityFeedUpdateManyWithWhereWithoutUserInput | Prisma.OpportunityFeedUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.OpportunityFeedScalarWhereInput | Prisma.OpportunityFeedScalarWhereInput[];
};
export type OpportunityFeedCreateWithoutOpportunitiesInput = {
    id?: string;
    name: string;
    intent: string;
    includeTerms?: Prisma.OpportunityFeedCreateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedCreateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedCreatelanguagesInput | string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutOpportunityFeedsInput;
    searchQueries?: Prisma.SearchQueryCreateNestedManyWithoutOpportunityFeedInput;
};
export type OpportunityFeedUncheckedCreateWithoutOpportunitiesInput = {
    id?: string;
    name: string;
    intent: string;
    includeTerms?: Prisma.OpportunityFeedCreateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedCreateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedCreatelanguagesInput | string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    searchQueries?: Prisma.SearchQueryUncheckedCreateNestedManyWithoutOpportunityFeedInput;
};
export type OpportunityFeedCreateOrConnectWithoutOpportunitiesInput = {
    where: Prisma.OpportunityFeedWhereUniqueInput;
    create: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutOpportunitiesInput, Prisma.OpportunityFeedUncheckedCreateWithoutOpportunitiesInput>;
};
export type OpportunityFeedUpsertWithoutOpportunitiesInput = {
    update: Prisma.XOR<Prisma.OpportunityFeedUpdateWithoutOpportunitiesInput, Prisma.OpportunityFeedUncheckedUpdateWithoutOpportunitiesInput>;
    create: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutOpportunitiesInput, Prisma.OpportunityFeedUncheckedCreateWithoutOpportunitiesInput>;
    where?: Prisma.OpportunityFeedWhereInput;
};
export type OpportunityFeedUpdateToOneWithWhereWithoutOpportunitiesInput = {
    where?: Prisma.OpportunityFeedWhereInput;
    data: Prisma.XOR<Prisma.OpportunityFeedUpdateWithoutOpportunitiesInput, Prisma.OpportunityFeedUncheckedUpdateWithoutOpportunitiesInput>;
};
export type OpportunityFeedUpdateWithoutOpportunitiesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutOpportunityFeedsNestedInput;
    searchQueries?: Prisma.SearchQueryUpdateManyWithoutOpportunityFeedNestedInput;
};
export type OpportunityFeedUncheckedUpdateWithoutOpportunitiesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    searchQueries?: Prisma.SearchQueryUncheckedUpdateManyWithoutOpportunityFeedNestedInput;
};
export type OpportunityFeedCreateWithoutSearchQueriesInput = {
    id?: string;
    name: string;
    intent: string;
    includeTerms?: Prisma.OpportunityFeedCreateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedCreateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedCreatelanguagesInput | string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutOpportunityFeedsInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutOpportunityFeedInput;
};
export type OpportunityFeedUncheckedCreateWithoutSearchQueriesInput = {
    id?: string;
    name: string;
    intent: string;
    includeTerms?: Prisma.OpportunityFeedCreateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedCreateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedCreatelanguagesInput | string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunities?: Prisma.OpportunityUncheckedCreateNestedManyWithoutOpportunityFeedInput;
};
export type OpportunityFeedCreateOrConnectWithoutSearchQueriesInput = {
    where: Prisma.OpportunityFeedWhereUniqueInput;
    create: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutSearchQueriesInput, Prisma.OpportunityFeedUncheckedCreateWithoutSearchQueriesInput>;
};
export type OpportunityFeedUpsertWithoutSearchQueriesInput = {
    update: Prisma.XOR<Prisma.OpportunityFeedUpdateWithoutSearchQueriesInput, Prisma.OpportunityFeedUncheckedUpdateWithoutSearchQueriesInput>;
    create: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutSearchQueriesInput, Prisma.OpportunityFeedUncheckedCreateWithoutSearchQueriesInput>;
    where?: Prisma.OpportunityFeedWhereInput;
};
export type OpportunityFeedUpdateToOneWithWhereWithoutSearchQueriesInput = {
    where?: Prisma.OpportunityFeedWhereInput;
    data: Prisma.XOR<Prisma.OpportunityFeedUpdateWithoutSearchQueriesInput, Prisma.OpportunityFeedUncheckedUpdateWithoutSearchQueriesInput>;
};
export type OpportunityFeedUpdateWithoutSearchQueriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutOpportunityFeedsNestedInput;
    opportunities?: Prisma.OpportunityUpdateManyWithoutOpportunityFeedNestedInput;
};
export type OpportunityFeedUncheckedUpdateWithoutSearchQueriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunities?: Prisma.OpportunityUncheckedUpdateManyWithoutOpportunityFeedNestedInput;
};
export type OpportunityFeedCreateWithoutUserInput = {
    id?: string;
    name: string;
    intent: string;
    includeTerms?: Prisma.OpportunityFeedCreateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedCreateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedCreatelanguagesInput | string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    searchQueries?: Prisma.SearchQueryCreateNestedManyWithoutOpportunityFeedInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutOpportunityFeedInput;
};
export type OpportunityFeedUncheckedCreateWithoutUserInput = {
    id?: string;
    name: string;
    intent: string;
    includeTerms?: Prisma.OpportunityFeedCreateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedCreateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedCreatelanguagesInput | string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    searchQueries?: Prisma.SearchQueryUncheckedCreateNestedManyWithoutOpportunityFeedInput;
    opportunities?: Prisma.OpportunityUncheckedCreateNestedManyWithoutOpportunityFeedInput;
};
export type OpportunityFeedCreateOrConnectWithoutUserInput = {
    where: Prisma.OpportunityFeedWhereUniqueInput;
    create: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutUserInput, Prisma.OpportunityFeedUncheckedCreateWithoutUserInput>;
};
export type OpportunityFeedCreateManyUserInputEnvelope = {
    data: Prisma.OpportunityFeedCreateManyUserInput | Prisma.OpportunityFeedCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type OpportunityFeedUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.OpportunityFeedWhereUniqueInput;
    update: Prisma.XOR<Prisma.OpportunityFeedUpdateWithoutUserInput, Prisma.OpportunityFeedUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.OpportunityFeedCreateWithoutUserInput, Prisma.OpportunityFeedUncheckedCreateWithoutUserInput>;
};
export type OpportunityFeedUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.OpportunityFeedWhereUniqueInput;
    data: Prisma.XOR<Prisma.OpportunityFeedUpdateWithoutUserInput, Prisma.OpportunityFeedUncheckedUpdateWithoutUserInput>;
};
export type OpportunityFeedUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.OpportunityFeedScalarWhereInput;
    data: Prisma.XOR<Prisma.OpportunityFeedUpdateManyMutationInput, Prisma.OpportunityFeedUncheckedUpdateManyWithoutUserInput>;
};
export type OpportunityFeedScalarWhereInput = {
    AND?: Prisma.OpportunityFeedScalarWhereInput | Prisma.OpportunityFeedScalarWhereInput[];
    OR?: Prisma.OpportunityFeedScalarWhereInput[];
    NOT?: Prisma.OpportunityFeedScalarWhereInput | Prisma.OpportunityFeedScalarWhereInput[];
    id?: Prisma.UuidFilter<"OpportunityFeed"> | string;
    name?: Prisma.StringFilter<"OpportunityFeed"> | string;
    intent?: Prisma.StringFilter<"OpportunityFeed"> | string;
    includeTerms?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    excludeTerms?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    languages?: Prisma.StringNullableListFilter<"OpportunityFeed">;
    freshnessHours?: Prisma.IntFilter<"OpportunityFeed"> | number;
    minScore?: Prisma.IntFilter<"OpportunityFeed"> | number;
    isActive?: Prisma.BoolFilter<"OpportunityFeed"> | boolean;
    userId?: Prisma.UuidFilter<"OpportunityFeed"> | string;
    createdAt?: Prisma.DateTimeFilter<"OpportunityFeed"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"OpportunityFeed"> | Date | string;
};
export type OpportunityFeedCreateManyUserInput = {
    id?: string;
    name: string;
    intent: string;
    includeTerms?: Prisma.OpportunityFeedCreateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedCreateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedCreatelanguagesInput | string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type OpportunityFeedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    searchQueries?: Prisma.SearchQueryUpdateManyWithoutOpportunityFeedNestedInput;
    opportunities?: Prisma.OpportunityUpdateManyWithoutOpportunityFeedNestedInput;
};
export type OpportunityFeedUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    searchQueries?: Prisma.SearchQueryUncheckedUpdateManyWithoutOpportunityFeedNestedInput;
    opportunities?: Prisma.OpportunityUncheckedUpdateManyWithoutOpportunityFeedNestedInput;
};
export type OpportunityFeedUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    intent?: Prisma.StringFieldUpdateOperationsInput | string;
    includeTerms?: Prisma.OpportunityFeedUpdateincludeTermsInput | string[];
    excludeTerms?: Prisma.OpportunityFeedUpdateexcludeTermsInput | string[];
    languages?: Prisma.OpportunityFeedUpdatelanguagesInput | string[];
    freshnessHours?: Prisma.IntFieldUpdateOperationsInput | number;
    minScore?: Prisma.IntFieldUpdateOperationsInput | number;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunityFeedCountOutputType = {
    searchQueries: number;
    opportunities: number;
};
export type OpportunityFeedCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    searchQueries?: boolean | OpportunityFeedCountOutputTypeCountSearchQueriesArgs;
    opportunities?: boolean | OpportunityFeedCountOutputTypeCountOpportunitiesArgs;
};
export type OpportunityFeedCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedCountOutputTypeSelect<ExtArgs> | null;
};
export type OpportunityFeedCountOutputTypeCountSearchQueriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SearchQueryWhereInput;
};
export type OpportunityFeedCountOutputTypeCountOpportunitiesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunityWhereInput;
};
export type OpportunityFeedSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    intent?: boolean;
    includeTerms?: boolean;
    excludeTerms?: boolean;
    languages?: boolean;
    freshnessHours?: boolean;
    minScore?: boolean;
    isActive?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    searchQueries?: boolean | Prisma.OpportunityFeed$searchQueriesArgs<ExtArgs>;
    opportunities?: boolean | Prisma.OpportunityFeed$opportunitiesArgs<ExtArgs>;
    _count?: boolean | Prisma.OpportunityFeedCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["opportunityFeed"]>;
export type OpportunityFeedSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    intent?: boolean;
    includeTerms?: boolean;
    excludeTerms?: boolean;
    languages?: boolean;
    freshnessHours?: boolean;
    minScore?: boolean;
    isActive?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["opportunityFeed"]>;
export type OpportunityFeedSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    intent?: boolean;
    includeTerms?: boolean;
    excludeTerms?: boolean;
    languages?: boolean;
    freshnessHours?: boolean;
    minScore?: boolean;
    isActive?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["opportunityFeed"]>;
export type OpportunityFeedSelectScalar = {
    id?: boolean;
    name?: boolean;
    intent?: boolean;
    includeTerms?: boolean;
    excludeTerms?: boolean;
    languages?: boolean;
    freshnessHours?: boolean;
    minScore?: boolean;
    isActive?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type OpportunityFeedOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "intent" | "includeTerms" | "excludeTerms" | "languages" | "freshnessHours" | "minScore" | "isActive" | "userId" | "createdAt" | "updatedAt", ExtArgs["result"]["opportunityFeed"]>;
export type OpportunityFeedInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    searchQueries?: boolean | Prisma.OpportunityFeed$searchQueriesArgs<ExtArgs>;
    opportunities?: boolean | Prisma.OpportunityFeed$opportunitiesArgs<ExtArgs>;
    _count?: boolean | Prisma.OpportunityFeedCountOutputTypeDefaultArgs<ExtArgs>;
};
export type OpportunityFeedIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type OpportunityFeedIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $OpportunityFeedPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "OpportunityFeed";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        searchQueries: Prisma.$SearchQueryPayload<ExtArgs>[];
        opportunities: Prisma.$OpportunityPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        intent: string;
        includeTerms: string[];
        excludeTerms: string[];
        languages: string[];
        freshnessHours: number;
        minScore: number;
        isActive: boolean;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["opportunityFeed"]>;
    composites: {};
};
export type OpportunityFeedGetPayload<S extends boolean | null | undefined | OpportunityFeedDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload, S>;
export type OpportunityFeedCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<OpportunityFeedFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: OpportunityFeedCountAggregateInputType | true;
};
export interface OpportunityFeedDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['OpportunityFeed'];
        meta: {
            name: 'OpportunityFeed';
        };
    };
    findUnique<T extends OpportunityFeedFindUniqueArgs>(args: Prisma.SelectSubset<T, OpportunityFeedFindUniqueArgs<ExtArgs>>): Prisma.Prisma__OpportunityFeedClient<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends OpportunityFeedFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, OpportunityFeedFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__OpportunityFeedClient<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends OpportunityFeedFindFirstArgs>(args?: Prisma.SelectSubset<T, OpportunityFeedFindFirstArgs<ExtArgs>>): Prisma.Prisma__OpportunityFeedClient<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends OpportunityFeedFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, OpportunityFeedFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__OpportunityFeedClient<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends OpportunityFeedFindManyArgs>(args?: Prisma.SelectSubset<T, OpportunityFeedFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends OpportunityFeedCreateArgs>(args: Prisma.SelectSubset<T, OpportunityFeedCreateArgs<ExtArgs>>): Prisma.Prisma__OpportunityFeedClient<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends OpportunityFeedCreateManyArgs>(args?: Prisma.SelectSubset<T, OpportunityFeedCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends OpportunityFeedCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, OpportunityFeedCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends OpportunityFeedDeleteArgs>(args: Prisma.SelectSubset<T, OpportunityFeedDeleteArgs<ExtArgs>>): Prisma.Prisma__OpportunityFeedClient<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends OpportunityFeedUpdateArgs>(args: Prisma.SelectSubset<T, OpportunityFeedUpdateArgs<ExtArgs>>): Prisma.Prisma__OpportunityFeedClient<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends OpportunityFeedDeleteManyArgs>(args?: Prisma.SelectSubset<T, OpportunityFeedDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends OpportunityFeedUpdateManyArgs>(args: Prisma.SelectSubset<T, OpportunityFeedUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends OpportunityFeedUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, OpportunityFeedUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends OpportunityFeedUpsertArgs>(args: Prisma.SelectSubset<T, OpportunityFeedUpsertArgs<ExtArgs>>): Prisma.Prisma__OpportunityFeedClient<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends OpportunityFeedCountArgs>(args?: Prisma.Subset<T, OpportunityFeedCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], OpportunityFeedCountAggregateOutputType> : number>;
    aggregate<T extends OpportunityFeedAggregateArgs>(args: Prisma.Subset<T, OpportunityFeedAggregateArgs>): Prisma.PrismaPromise<GetOpportunityFeedAggregateType<T>>;
    groupBy<T extends OpportunityFeedGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: OpportunityFeedGroupByArgs['orderBy'];
    } : {
        orderBy?: OpportunityFeedGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, OpportunityFeedGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOpportunityFeedGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: OpportunityFeedFieldRefs;
}
export interface Prisma__OpportunityFeedClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    searchQueries<T extends Prisma.OpportunityFeed$searchQueriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OpportunityFeed$searchQueriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    opportunities<T extends Prisma.OpportunityFeed$opportunitiesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OpportunityFeed$opportunitiesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface OpportunityFeedFieldRefs {
    readonly id: Prisma.FieldRef<"OpportunityFeed", 'String'>;
    readonly name: Prisma.FieldRef<"OpportunityFeed", 'String'>;
    readonly intent: Prisma.FieldRef<"OpportunityFeed", 'String'>;
    readonly includeTerms: Prisma.FieldRef<"OpportunityFeed", 'String[]'>;
    readonly excludeTerms: Prisma.FieldRef<"OpportunityFeed", 'String[]'>;
    readonly languages: Prisma.FieldRef<"OpportunityFeed", 'String[]'>;
    readonly freshnessHours: Prisma.FieldRef<"OpportunityFeed", 'Int'>;
    readonly minScore: Prisma.FieldRef<"OpportunityFeed", 'Int'>;
    readonly isActive: Prisma.FieldRef<"OpportunityFeed", 'Boolean'>;
    readonly userId: Prisma.FieldRef<"OpportunityFeed", 'String'>;
    readonly createdAt: Prisma.FieldRef<"OpportunityFeed", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"OpportunityFeed", 'DateTime'>;
}
export type OpportunityFeedFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelect<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    include?: Prisma.OpportunityFeedInclude<ExtArgs> | null;
    where: Prisma.OpportunityFeedWhereUniqueInput;
};
export type OpportunityFeedFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelect<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    include?: Prisma.OpportunityFeedInclude<ExtArgs> | null;
    where: Prisma.OpportunityFeedWhereUniqueInput;
};
export type OpportunityFeedFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelect<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    include?: Prisma.OpportunityFeedInclude<ExtArgs> | null;
    where?: Prisma.OpportunityFeedWhereInput;
    orderBy?: Prisma.OpportunityFeedOrderByWithRelationInput | Prisma.OpportunityFeedOrderByWithRelationInput[];
    cursor?: Prisma.OpportunityFeedWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OpportunityFeedScalarFieldEnum | Prisma.OpportunityFeedScalarFieldEnum[];
};
export type OpportunityFeedFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelect<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    include?: Prisma.OpportunityFeedInclude<ExtArgs> | null;
    where?: Prisma.OpportunityFeedWhereInput;
    orderBy?: Prisma.OpportunityFeedOrderByWithRelationInput | Prisma.OpportunityFeedOrderByWithRelationInput[];
    cursor?: Prisma.OpportunityFeedWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OpportunityFeedScalarFieldEnum | Prisma.OpportunityFeedScalarFieldEnum[];
};
export type OpportunityFeedFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelect<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    include?: Prisma.OpportunityFeedInclude<ExtArgs> | null;
    where?: Prisma.OpportunityFeedWhereInput;
    orderBy?: Prisma.OpportunityFeedOrderByWithRelationInput | Prisma.OpportunityFeedOrderByWithRelationInput[];
    cursor?: Prisma.OpportunityFeedWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OpportunityFeedScalarFieldEnum | Prisma.OpportunityFeedScalarFieldEnum[];
};
export type OpportunityFeedCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelect<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    include?: Prisma.OpportunityFeedInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OpportunityFeedCreateInput, Prisma.OpportunityFeedUncheckedCreateInput>;
};
export type OpportunityFeedCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.OpportunityFeedCreateManyInput | Prisma.OpportunityFeedCreateManyInput[];
    skipDuplicates?: boolean;
};
export type OpportunityFeedCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    data: Prisma.OpportunityFeedCreateManyInput | Prisma.OpportunityFeedCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.OpportunityFeedIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type OpportunityFeedUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelect<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    include?: Prisma.OpportunityFeedInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OpportunityFeedUpdateInput, Prisma.OpportunityFeedUncheckedUpdateInput>;
    where: Prisma.OpportunityFeedWhereUniqueInput;
};
export type OpportunityFeedUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.OpportunityFeedUpdateManyMutationInput, Prisma.OpportunityFeedUncheckedUpdateManyInput>;
    where?: Prisma.OpportunityFeedWhereInput;
    limit?: number;
};
export type OpportunityFeedUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OpportunityFeedUpdateManyMutationInput, Prisma.OpportunityFeedUncheckedUpdateManyInput>;
    where?: Prisma.OpportunityFeedWhereInput;
    limit?: number;
    include?: Prisma.OpportunityFeedIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type OpportunityFeedUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelect<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    include?: Prisma.OpportunityFeedInclude<ExtArgs> | null;
    where: Prisma.OpportunityFeedWhereUniqueInput;
    create: Prisma.XOR<Prisma.OpportunityFeedCreateInput, Prisma.OpportunityFeedUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.OpportunityFeedUpdateInput, Prisma.OpportunityFeedUncheckedUpdateInput>;
};
export type OpportunityFeedDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelect<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    include?: Prisma.OpportunityFeedInclude<ExtArgs> | null;
    where: Prisma.OpportunityFeedWhereUniqueInput;
};
export type OpportunityFeedDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunityFeedWhereInput;
    limit?: number;
};
export type OpportunityFeed$searchQueriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.SearchQueryOmit<ExtArgs> | null;
    include?: Prisma.SearchQueryInclude<ExtArgs> | null;
    where?: Prisma.SearchQueryWhereInput;
    orderBy?: Prisma.SearchQueryOrderByWithRelationInput | Prisma.SearchQueryOrderByWithRelationInput[];
    cursor?: Prisma.SearchQueryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SearchQueryScalarFieldEnum | Prisma.SearchQueryScalarFieldEnum[];
};
export type OpportunityFeed$opportunitiesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySelect<ExtArgs> | null;
    omit?: Prisma.OpportunityOmit<ExtArgs> | null;
    include?: Prisma.OpportunityInclude<ExtArgs> | null;
    where?: Prisma.OpportunityWhereInput;
    orderBy?: Prisma.OpportunityOrderByWithRelationInput | Prisma.OpportunityOrderByWithRelationInput[];
    cursor?: Prisma.OpportunityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OpportunityScalarFieldEnum | Prisma.OpportunityScalarFieldEnum[];
};
export type OpportunityFeedDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityFeedSelect<ExtArgs> | null;
    omit?: Prisma.OpportunityFeedOmit<ExtArgs> | null;
    include?: Prisma.OpportunityFeedInclude<ExtArgs> | null;
};
