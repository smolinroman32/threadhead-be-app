import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SearchQueryModel = runtime.Types.Result.DefaultSelection<Prisma.$SearchQueryPayload>;
export type AggregateSearchQuery = {
    _count: SearchQueryCountAggregateOutputType | null;
    _avg: SearchQueryAvgAggregateOutputType | null;
    _sum: SearchQuerySumAggregateOutputType | null;
    _min: SearchQueryMinAggregateOutputType | null;
    _max: SearchQueryMaxAggregateOutputType | null;
};
export type SearchQueryAvgAggregateOutputType = {
    matchedPosts: number | null;
    relevantPosts: number | null;
};
export type SearchQuerySumAggregateOutputType = {
    matchedPosts: number | null;
    relevantPosts: number | null;
};
export type SearchQueryMinAggregateOutputType = {
    id: string | null;
    opportunityFeedId: string | null;
    query: string | null;
    type: $Enums.SearchQueryType | null;
    isActive: boolean | null;
    matchedPosts: number | null;
    relevantPosts: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SearchQueryMaxAggregateOutputType = {
    id: string | null;
    opportunityFeedId: string | null;
    query: string | null;
    type: $Enums.SearchQueryType | null;
    isActive: boolean | null;
    matchedPosts: number | null;
    relevantPosts: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SearchQueryCountAggregateOutputType = {
    id: number;
    opportunityFeedId: number;
    query: number;
    type: number;
    isActive: number;
    matchedPosts: number;
    relevantPosts: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type SearchQueryAvgAggregateInputType = {
    matchedPosts?: true;
    relevantPosts?: true;
};
export type SearchQuerySumAggregateInputType = {
    matchedPosts?: true;
    relevantPosts?: true;
};
export type SearchQueryMinAggregateInputType = {
    id?: true;
    opportunityFeedId?: true;
    query?: true;
    type?: true;
    isActive?: true;
    matchedPosts?: true;
    relevantPosts?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SearchQueryMaxAggregateInputType = {
    id?: true;
    opportunityFeedId?: true;
    query?: true;
    type?: true;
    isActive?: true;
    matchedPosts?: true;
    relevantPosts?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SearchQueryCountAggregateInputType = {
    id?: true;
    opportunityFeedId?: true;
    query?: true;
    type?: true;
    isActive?: true;
    matchedPosts?: true;
    relevantPosts?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type SearchQueryAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SearchQueryWhereInput;
    orderBy?: Prisma.SearchQueryOrderByWithRelationInput | Prisma.SearchQueryOrderByWithRelationInput[];
    cursor?: Prisma.SearchQueryWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SearchQueryCountAggregateInputType;
    _avg?: SearchQueryAvgAggregateInputType;
    _sum?: SearchQuerySumAggregateInputType;
    _min?: SearchQueryMinAggregateInputType;
    _max?: SearchQueryMaxAggregateInputType;
};
export type GetSearchQueryAggregateType<T extends SearchQueryAggregateArgs> = {
    [P in keyof T & keyof AggregateSearchQuery]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSearchQuery[P]> : Prisma.GetScalarType<T[P], AggregateSearchQuery[P]>;
};
export type SearchQueryGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SearchQueryWhereInput;
    orderBy?: Prisma.SearchQueryOrderByWithAggregationInput | Prisma.SearchQueryOrderByWithAggregationInput[];
    by: Prisma.SearchQueryScalarFieldEnum[] | Prisma.SearchQueryScalarFieldEnum;
    having?: Prisma.SearchQueryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SearchQueryCountAggregateInputType | true;
    _avg?: SearchQueryAvgAggregateInputType;
    _sum?: SearchQuerySumAggregateInputType;
    _min?: SearchQueryMinAggregateInputType;
    _max?: SearchQueryMaxAggregateInputType;
};
export type SearchQueryGroupByOutputType = {
    id: string;
    opportunityFeedId: string;
    query: string;
    type: $Enums.SearchQueryType;
    isActive: boolean;
    matchedPosts: number;
    relevantPosts: number;
    createdAt: Date;
    updatedAt: Date;
    _count: SearchQueryCountAggregateOutputType | null;
    _avg: SearchQueryAvgAggregateOutputType | null;
    _sum: SearchQuerySumAggregateOutputType | null;
    _min: SearchQueryMinAggregateOutputType | null;
    _max: SearchQueryMaxAggregateOutputType | null;
};
export type GetSearchQueryGroupByPayload<T extends SearchQueryGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SearchQueryGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SearchQueryGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SearchQueryGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SearchQueryGroupByOutputType[P]>;
}>>;
export type SearchQueryWhereInput = {
    AND?: Prisma.SearchQueryWhereInput | Prisma.SearchQueryWhereInput[];
    OR?: Prisma.SearchQueryWhereInput[];
    NOT?: Prisma.SearchQueryWhereInput | Prisma.SearchQueryWhereInput[];
    id?: Prisma.UuidFilter<"SearchQuery"> | string;
    opportunityFeedId?: Prisma.UuidFilter<"SearchQuery"> | string;
    query?: Prisma.StringFilter<"SearchQuery"> | string;
    type?: Prisma.EnumSearchQueryTypeFilter<"SearchQuery"> | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFilter<"SearchQuery"> | boolean;
    matchedPosts?: Prisma.IntFilter<"SearchQuery"> | number;
    relevantPosts?: Prisma.IntFilter<"SearchQuery"> | number;
    createdAt?: Prisma.DateTimeFilter<"SearchQuery"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"SearchQuery"> | Date | string;
    opportunityFeed?: Prisma.XOR<Prisma.OpportunityFeedScalarRelationFilter, Prisma.OpportunityFeedWhereInput>;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryListRelationFilter;
};
export type SearchQueryOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    opportunityFeedId?: Prisma.SortOrder;
    query?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    matchedPosts?: Prisma.SortOrder;
    relevantPosts?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    opportunityFeed?: Prisma.OpportunityFeedOrderByWithRelationInput;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryOrderByRelationAggregateInput;
};
export type SearchQueryWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.SearchQueryWhereInput | Prisma.SearchQueryWhereInput[];
    OR?: Prisma.SearchQueryWhereInput[];
    NOT?: Prisma.SearchQueryWhereInput | Prisma.SearchQueryWhereInput[];
    opportunityFeedId?: Prisma.UuidFilter<"SearchQuery"> | string;
    query?: Prisma.StringFilter<"SearchQuery"> | string;
    type?: Prisma.EnumSearchQueryTypeFilter<"SearchQuery"> | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFilter<"SearchQuery"> | boolean;
    matchedPosts?: Prisma.IntFilter<"SearchQuery"> | number;
    relevantPosts?: Prisma.IntFilter<"SearchQuery"> | number;
    createdAt?: Prisma.DateTimeFilter<"SearchQuery"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"SearchQuery"> | Date | string;
    opportunityFeed?: Prisma.XOR<Prisma.OpportunityFeedScalarRelationFilter, Prisma.OpportunityFeedWhereInput>;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryListRelationFilter;
}, "id">;
export type SearchQueryOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    opportunityFeedId?: Prisma.SortOrder;
    query?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    matchedPosts?: Prisma.SortOrder;
    relevantPosts?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.SearchQueryCountOrderByAggregateInput;
    _avg?: Prisma.SearchQueryAvgOrderByAggregateInput;
    _max?: Prisma.SearchQueryMaxOrderByAggregateInput;
    _min?: Prisma.SearchQueryMinOrderByAggregateInput;
    _sum?: Prisma.SearchQuerySumOrderByAggregateInput;
};
export type SearchQueryScalarWhereWithAggregatesInput = {
    AND?: Prisma.SearchQueryScalarWhereWithAggregatesInput | Prisma.SearchQueryScalarWhereWithAggregatesInput[];
    OR?: Prisma.SearchQueryScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SearchQueryScalarWhereWithAggregatesInput | Prisma.SearchQueryScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"SearchQuery"> | string;
    opportunityFeedId?: Prisma.UuidWithAggregatesFilter<"SearchQuery"> | string;
    query?: Prisma.StringWithAggregatesFilter<"SearchQuery"> | string;
    type?: Prisma.EnumSearchQueryTypeWithAggregatesFilter<"SearchQuery"> | $Enums.SearchQueryType;
    isActive?: Prisma.BoolWithAggregatesFilter<"SearchQuery"> | boolean;
    matchedPosts?: Prisma.IntWithAggregatesFilter<"SearchQuery"> | number;
    relevantPosts?: Prisma.IntWithAggregatesFilter<"SearchQuery"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"SearchQuery"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"SearchQuery"> | Date | string;
};
export type SearchQueryCreateInput = {
    id?: string;
    query: string;
    type: $Enums.SearchQueryType;
    isActive: boolean;
    matchedPosts: number;
    relevantPosts: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunityFeed: Prisma.OpportunityFeedCreateNestedOneWithoutSearchQueriesInput;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryCreateNestedManyWithoutSearchQueryInput;
};
export type SearchQueryUncheckedCreateInput = {
    id?: string;
    opportunityFeedId: string;
    query: string;
    type: $Enums.SearchQueryType;
    isActive: boolean;
    matchedPosts: number;
    relevantPosts: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUncheckedCreateNestedManyWithoutSearchQueryInput;
};
export type SearchQueryUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    query?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumSearchQueryTypeFieldUpdateOperationsInput | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    matchedPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    relevantPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunityFeed?: Prisma.OpportunityFeedUpdateOneRequiredWithoutSearchQueriesNestedInput;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUpdateManyWithoutSearchQueryNestedInput;
};
export type SearchQueryUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    opportunityFeedId?: Prisma.StringFieldUpdateOperationsInput | string;
    query?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumSearchQueryTypeFieldUpdateOperationsInput | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    matchedPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    relevantPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUncheckedUpdateManyWithoutSearchQueryNestedInput;
};
export type SearchQueryCreateManyInput = {
    id?: string;
    opportunityFeedId: string;
    query: string;
    type: $Enums.SearchQueryType;
    isActive: boolean;
    matchedPosts: number;
    relevantPosts: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SearchQueryUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    query?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumSearchQueryTypeFieldUpdateOperationsInput | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    matchedPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    relevantPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SearchQueryUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    opportunityFeedId?: Prisma.StringFieldUpdateOperationsInput | string;
    query?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumSearchQueryTypeFieldUpdateOperationsInput | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    matchedPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    relevantPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SearchQueryListRelationFilter = {
    every?: Prisma.SearchQueryWhereInput;
    some?: Prisma.SearchQueryWhereInput;
    none?: Prisma.SearchQueryWhereInput;
};
export type SearchQueryOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SearchQueryScalarRelationFilter = {
    is?: Prisma.SearchQueryWhereInput;
    isNot?: Prisma.SearchQueryWhereInput;
};
export type SearchQueryCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    opportunityFeedId?: Prisma.SortOrder;
    query?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    matchedPosts?: Prisma.SortOrder;
    relevantPosts?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SearchQueryAvgOrderByAggregateInput = {
    matchedPosts?: Prisma.SortOrder;
    relevantPosts?: Prisma.SortOrder;
};
export type SearchQueryMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    opportunityFeedId?: Prisma.SortOrder;
    query?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    matchedPosts?: Prisma.SortOrder;
    relevantPosts?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SearchQueryMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    opportunityFeedId?: Prisma.SortOrder;
    query?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    matchedPosts?: Prisma.SortOrder;
    relevantPosts?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SearchQuerySumOrderByAggregateInput = {
    matchedPosts?: Prisma.SortOrder;
    relevantPosts?: Prisma.SortOrder;
};
export type SearchQueryCreateNestedManyWithoutOpportunityFeedInput = {
    create?: Prisma.XOR<Prisma.SearchQueryCreateWithoutOpportunityFeedInput, Prisma.SearchQueryUncheckedCreateWithoutOpportunityFeedInput> | Prisma.SearchQueryCreateWithoutOpportunityFeedInput[] | Prisma.SearchQueryUncheckedCreateWithoutOpportunityFeedInput[];
    connectOrCreate?: Prisma.SearchQueryCreateOrConnectWithoutOpportunityFeedInput | Prisma.SearchQueryCreateOrConnectWithoutOpportunityFeedInput[];
    createMany?: Prisma.SearchQueryCreateManyOpportunityFeedInputEnvelope;
    connect?: Prisma.SearchQueryWhereUniqueInput | Prisma.SearchQueryWhereUniqueInput[];
};
export type SearchQueryUncheckedCreateNestedManyWithoutOpportunityFeedInput = {
    create?: Prisma.XOR<Prisma.SearchQueryCreateWithoutOpportunityFeedInput, Prisma.SearchQueryUncheckedCreateWithoutOpportunityFeedInput> | Prisma.SearchQueryCreateWithoutOpportunityFeedInput[] | Prisma.SearchQueryUncheckedCreateWithoutOpportunityFeedInput[];
    connectOrCreate?: Prisma.SearchQueryCreateOrConnectWithoutOpportunityFeedInput | Prisma.SearchQueryCreateOrConnectWithoutOpportunityFeedInput[];
    createMany?: Prisma.SearchQueryCreateManyOpportunityFeedInputEnvelope;
    connect?: Prisma.SearchQueryWhereUniqueInput | Prisma.SearchQueryWhereUniqueInput[];
};
export type SearchQueryUpdateManyWithoutOpportunityFeedNestedInput = {
    create?: Prisma.XOR<Prisma.SearchQueryCreateWithoutOpportunityFeedInput, Prisma.SearchQueryUncheckedCreateWithoutOpportunityFeedInput> | Prisma.SearchQueryCreateWithoutOpportunityFeedInput[] | Prisma.SearchQueryUncheckedCreateWithoutOpportunityFeedInput[];
    connectOrCreate?: Prisma.SearchQueryCreateOrConnectWithoutOpportunityFeedInput | Prisma.SearchQueryCreateOrConnectWithoutOpportunityFeedInput[];
    upsert?: Prisma.SearchQueryUpsertWithWhereUniqueWithoutOpportunityFeedInput | Prisma.SearchQueryUpsertWithWhereUniqueWithoutOpportunityFeedInput[];
    createMany?: Prisma.SearchQueryCreateManyOpportunityFeedInputEnvelope;
    set?: Prisma.SearchQueryWhereUniqueInput | Prisma.SearchQueryWhereUniqueInput[];
    disconnect?: Prisma.SearchQueryWhereUniqueInput | Prisma.SearchQueryWhereUniqueInput[];
    delete?: Prisma.SearchQueryWhereUniqueInput | Prisma.SearchQueryWhereUniqueInput[];
    connect?: Prisma.SearchQueryWhereUniqueInput | Prisma.SearchQueryWhereUniqueInput[];
    update?: Prisma.SearchQueryUpdateWithWhereUniqueWithoutOpportunityFeedInput | Prisma.SearchQueryUpdateWithWhereUniqueWithoutOpportunityFeedInput[];
    updateMany?: Prisma.SearchQueryUpdateManyWithWhereWithoutOpportunityFeedInput | Prisma.SearchQueryUpdateManyWithWhereWithoutOpportunityFeedInput[];
    deleteMany?: Prisma.SearchQueryScalarWhereInput | Prisma.SearchQueryScalarWhereInput[];
};
export type SearchQueryUncheckedUpdateManyWithoutOpportunityFeedNestedInput = {
    create?: Prisma.XOR<Prisma.SearchQueryCreateWithoutOpportunityFeedInput, Prisma.SearchQueryUncheckedCreateWithoutOpportunityFeedInput> | Prisma.SearchQueryCreateWithoutOpportunityFeedInput[] | Prisma.SearchQueryUncheckedCreateWithoutOpportunityFeedInput[];
    connectOrCreate?: Prisma.SearchQueryCreateOrConnectWithoutOpportunityFeedInput | Prisma.SearchQueryCreateOrConnectWithoutOpportunityFeedInput[];
    upsert?: Prisma.SearchQueryUpsertWithWhereUniqueWithoutOpportunityFeedInput | Prisma.SearchQueryUpsertWithWhereUniqueWithoutOpportunityFeedInput[];
    createMany?: Prisma.SearchQueryCreateManyOpportunityFeedInputEnvelope;
    set?: Prisma.SearchQueryWhereUniqueInput | Prisma.SearchQueryWhereUniqueInput[];
    disconnect?: Prisma.SearchQueryWhereUniqueInput | Prisma.SearchQueryWhereUniqueInput[];
    delete?: Prisma.SearchQueryWhereUniqueInput | Prisma.SearchQueryWhereUniqueInput[];
    connect?: Prisma.SearchQueryWhereUniqueInput | Prisma.SearchQueryWhereUniqueInput[];
    update?: Prisma.SearchQueryUpdateWithWhereUniqueWithoutOpportunityFeedInput | Prisma.SearchQueryUpdateWithWhereUniqueWithoutOpportunityFeedInput[];
    updateMany?: Prisma.SearchQueryUpdateManyWithWhereWithoutOpportunityFeedInput | Prisma.SearchQueryUpdateManyWithWhereWithoutOpportunityFeedInput[];
    deleteMany?: Prisma.SearchQueryScalarWhereInput | Prisma.SearchQueryScalarWhereInput[];
};
export type SearchQueryCreateNestedOneWithoutOpportunitySearchQueriesInput = {
    create?: Prisma.XOR<Prisma.SearchQueryCreateWithoutOpportunitySearchQueriesInput, Prisma.SearchQueryUncheckedCreateWithoutOpportunitySearchQueriesInput>;
    connectOrCreate?: Prisma.SearchQueryCreateOrConnectWithoutOpportunitySearchQueriesInput;
    connect?: Prisma.SearchQueryWhereUniqueInput;
};
export type SearchQueryUpdateOneRequiredWithoutOpportunitySearchQueriesNestedInput = {
    create?: Prisma.XOR<Prisma.SearchQueryCreateWithoutOpportunitySearchQueriesInput, Prisma.SearchQueryUncheckedCreateWithoutOpportunitySearchQueriesInput>;
    connectOrCreate?: Prisma.SearchQueryCreateOrConnectWithoutOpportunitySearchQueriesInput;
    upsert?: Prisma.SearchQueryUpsertWithoutOpportunitySearchQueriesInput;
    connect?: Prisma.SearchQueryWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SearchQueryUpdateToOneWithWhereWithoutOpportunitySearchQueriesInput, Prisma.SearchQueryUpdateWithoutOpportunitySearchQueriesInput>, Prisma.SearchQueryUncheckedUpdateWithoutOpportunitySearchQueriesInput>;
};
export type EnumSearchQueryTypeFieldUpdateOperationsInput = {
    set?: $Enums.SearchQueryType;
};
export type SearchQueryCreateWithoutOpportunityFeedInput = {
    id?: string;
    query: string;
    type: $Enums.SearchQueryType;
    isActive: boolean;
    matchedPosts: number;
    relevantPosts: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryCreateNestedManyWithoutSearchQueryInput;
};
export type SearchQueryUncheckedCreateWithoutOpportunityFeedInput = {
    id?: string;
    query: string;
    type: $Enums.SearchQueryType;
    isActive: boolean;
    matchedPosts: number;
    relevantPosts: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUncheckedCreateNestedManyWithoutSearchQueryInput;
};
export type SearchQueryCreateOrConnectWithoutOpportunityFeedInput = {
    where: Prisma.SearchQueryWhereUniqueInput;
    create: Prisma.XOR<Prisma.SearchQueryCreateWithoutOpportunityFeedInput, Prisma.SearchQueryUncheckedCreateWithoutOpportunityFeedInput>;
};
export type SearchQueryCreateManyOpportunityFeedInputEnvelope = {
    data: Prisma.SearchQueryCreateManyOpportunityFeedInput | Prisma.SearchQueryCreateManyOpportunityFeedInput[];
    skipDuplicates?: boolean;
};
export type SearchQueryUpsertWithWhereUniqueWithoutOpportunityFeedInput = {
    where: Prisma.SearchQueryWhereUniqueInput;
    update: Prisma.XOR<Prisma.SearchQueryUpdateWithoutOpportunityFeedInput, Prisma.SearchQueryUncheckedUpdateWithoutOpportunityFeedInput>;
    create: Prisma.XOR<Prisma.SearchQueryCreateWithoutOpportunityFeedInput, Prisma.SearchQueryUncheckedCreateWithoutOpportunityFeedInput>;
};
export type SearchQueryUpdateWithWhereUniqueWithoutOpportunityFeedInput = {
    where: Prisma.SearchQueryWhereUniqueInput;
    data: Prisma.XOR<Prisma.SearchQueryUpdateWithoutOpportunityFeedInput, Prisma.SearchQueryUncheckedUpdateWithoutOpportunityFeedInput>;
};
export type SearchQueryUpdateManyWithWhereWithoutOpportunityFeedInput = {
    where: Prisma.SearchQueryScalarWhereInput;
    data: Prisma.XOR<Prisma.SearchQueryUpdateManyMutationInput, Prisma.SearchQueryUncheckedUpdateManyWithoutOpportunityFeedInput>;
};
export type SearchQueryScalarWhereInput = {
    AND?: Prisma.SearchQueryScalarWhereInput | Prisma.SearchQueryScalarWhereInput[];
    OR?: Prisma.SearchQueryScalarWhereInput[];
    NOT?: Prisma.SearchQueryScalarWhereInput | Prisma.SearchQueryScalarWhereInput[];
    id?: Prisma.UuidFilter<"SearchQuery"> | string;
    opportunityFeedId?: Prisma.UuidFilter<"SearchQuery"> | string;
    query?: Prisma.StringFilter<"SearchQuery"> | string;
    type?: Prisma.EnumSearchQueryTypeFilter<"SearchQuery"> | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFilter<"SearchQuery"> | boolean;
    matchedPosts?: Prisma.IntFilter<"SearchQuery"> | number;
    relevantPosts?: Prisma.IntFilter<"SearchQuery"> | number;
    createdAt?: Prisma.DateTimeFilter<"SearchQuery"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"SearchQuery"> | Date | string;
};
export type SearchQueryCreateWithoutOpportunitySearchQueriesInput = {
    id?: string;
    query: string;
    type: $Enums.SearchQueryType;
    isActive: boolean;
    matchedPosts: number;
    relevantPosts: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunityFeed: Prisma.OpportunityFeedCreateNestedOneWithoutSearchQueriesInput;
};
export type SearchQueryUncheckedCreateWithoutOpportunitySearchQueriesInput = {
    id?: string;
    opportunityFeedId: string;
    query: string;
    type: $Enums.SearchQueryType;
    isActive: boolean;
    matchedPosts: number;
    relevantPosts: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SearchQueryCreateOrConnectWithoutOpportunitySearchQueriesInput = {
    where: Prisma.SearchQueryWhereUniqueInput;
    create: Prisma.XOR<Prisma.SearchQueryCreateWithoutOpportunitySearchQueriesInput, Prisma.SearchQueryUncheckedCreateWithoutOpportunitySearchQueriesInput>;
};
export type SearchQueryUpsertWithoutOpportunitySearchQueriesInput = {
    update: Prisma.XOR<Prisma.SearchQueryUpdateWithoutOpportunitySearchQueriesInput, Prisma.SearchQueryUncheckedUpdateWithoutOpportunitySearchQueriesInput>;
    create: Prisma.XOR<Prisma.SearchQueryCreateWithoutOpportunitySearchQueriesInput, Prisma.SearchQueryUncheckedCreateWithoutOpportunitySearchQueriesInput>;
    where?: Prisma.SearchQueryWhereInput;
};
export type SearchQueryUpdateToOneWithWhereWithoutOpportunitySearchQueriesInput = {
    where?: Prisma.SearchQueryWhereInput;
    data: Prisma.XOR<Prisma.SearchQueryUpdateWithoutOpportunitySearchQueriesInput, Prisma.SearchQueryUncheckedUpdateWithoutOpportunitySearchQueriesInput>;
};
export type SearchQueryUpdateWithoutOpportunitySearchQueriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    query?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumSearchQueryTypeFieldUpdateOperationsInput | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    matchedPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    relevantPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunityFeed?: Prisma.OpportunityFeedUpdateOneRequiredWithoutSearchQueriesNestedInput;
};
export type SearchQueryUncheckedUpdateWithoutOpportunitySearchQueriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    opportunityFeedId?: Prisma.StringFieldUpdateOperationsInput | string;
    query?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumSearchQueryTypeFieldUpdateOperationsInput | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    matchedPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    relevantPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SearchQueryCreateManyOpportunityFeedInput = {
    id?: string;
    query: string;
    type: $Enums.SearchQueryType;
    isActive: boolean;
    matchedPosts: number;
    relevantPosts: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SearchQueryUpdateWithoutOpportunityFeedInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    query?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumSearchQueryTypeFieldUpdateOperationsInput | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    matchedPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    relevantPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUpdateManyWithoutSearchQueryNestedInput;
};
export type SearchQueryUncheckedUpdateWithoutOpportunityFeedInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    query?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumSearchQueryTypeFieldUpdateOperationsInput | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    matchedPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    relevantPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUncheckedUpdateManyWithoutSearchQueryNestedInput;
};
export type SearchQueryUncheckedUpdateManyWithoutOpportunityFeedInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    query?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumSearchQueryTypeFieldUpdateOperationsInput | $Enums.SearchQueryType;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    matchedPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    relevantPosts?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SearchQueryCountOutputType = {
    opportunitySearchQueries: number;
};
export type SearchQueryCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunitySearchQueries?: boolean | SearchQueryCountOutputTypeCountOpportunitySearchQueriesArgs;
};
export type SearchQueryCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQueryCountOutputTypeSelect<ExtArgs> | null;
};
export type SearchQueryCountOutputTypeCountOpportunitySearchQueriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunitySearchQueryWhereInput;
};
export type SearchQuerySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    opportunityFeedId?: boolean;
    query?: boolean;
    type?: boolean;
    isActive?: boolean;
    matchedPosts?: boolean;
    relevantPosts?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
    opportunitySearchQueries?: boolean | Prisma.SearchQuery$opportunitySearchQueriesArgs<ExtArgs>;
    _count?: boolean | Prisma.SearchQueryCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["searchQuery"]>;
export type SearchQuerySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    opportunityFeedId?: boolean;
    query?: boolean;
    type?: boolean;
    isActive?: boolean;
    matchedPosts?: boolean;
    relevantPosts?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["searchQuery"]>;
export type SearchQuerySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    opportunityFeedId?: boolean;
    query?: boolean;
    type?: boolean;
    isActive?: boolean;
    matchedPosts?: boolean;
    relevantPosts?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["searchQuery"]>;
export type SearchQuerySelectScalar = {
    id?: boolean;
    opportunityFeedId?: boolean;
    query?: boolean;
    type?: boolean;
    isActive?: boolean;
    matchedPosts?: boolean;
    relevantPosts?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type SearchQueryOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "opportunityFeedId" | "query" | "type" | "isActive" | "matchedPosts" | "relevantPosts" | "createdAt" | "updatedAt", ExtArgs["result"]["searchQuery"]>;
export type SearchQueryInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
    opportunitySearchQueries?: boolean | Prisma.SearchQuery$opportunitySearchQueriesArgs<ExtArgs>;
    _count?: boolean | Prisma.SearchQueryCountOutputTypeDefaultArgs<ExtArgs>;
};
export type SearchQueryIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
};
export type SearchQueryIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
};
export type $SearchQueryPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SearchQuery";
    objects: {
        opportunityFeed: Prisma.$OpportunityFeedPayload<ExtArgs>;
        opportunitySearchQueries: Prisma.$OpportunitySearchQueryPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        opportunityFeedId: string;
        query: string;
        type: $Enums.SearchQueryType;
        isActive: boolean;
        matchedPosts: number;
        relevantPosts: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["searchQuery"]>;
    composites: {};
};
export type SearchQueryGetPayload<S extends boolean | null | undefined | SearchQueryDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload, S>;
export type SearchQueryCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SearchQueryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SearchQueryCountAggregateInputType | true;
};
export interface SearchQueryDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SearchQuery'];
        meta: {
            name: 'SearchQuery';
        };
    };
    findUnique<T extends SearchQueryFindUniqueArgs>(args: Prisma.SelectSubset<T, SearchQueryFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SearchQueryClient<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SearchQueryFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SearchQueryFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SearchQueryClient<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SearchQueryFindFirstArgs>(args?: Prisma.SelectSubset<T, SearchQueryFindFirstArgs<ExtArgs>>): Prisma.Prisma__SearchQueryClient<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SearchQueryFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SearchQueryFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SearchQueryClient<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SearchQueryFindManyArgs>(args?: Prisma.SelectSubset<T, SearchQueryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SearchQueryCreateArgs>(args: Prisma.SelectSubset<T, SearchQueryCreateArgs<ExtArgs>>): Prisma.Prisma__SearchQueryClient<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SearchQueryCreateManyArgs>(args?: Prisma.SelectSubset<T, SearchQueryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SearchQueryCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SearchQueryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SearchQueryDeleteArgs>(args: Prisma.SelectSubset<T, SearchQueryDeleteArgs<ExtArgs>>): Prisma.Prisma__SearchQueryClient<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SearchQueryUpdateArgs>(args: Prisma.SelectSubset<T, SearchQueryUpdateArgs<ExtArgs>>): Prisma.Prisma__SearchQueryClient<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SearchQueryDeleteManyArgs>(args?: Prisma.SelectSubset<T, SearchQueryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SearchQueryUpdateManyArgs>(args: Prisma.SelectSubset<T, SearchQueryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SearchQueryUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SearchQueryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SearchQueryUpsertArgs>(args: Prisma.SelectSubset<T, SearchQueryUpsertArgs<ExtArgs>>): Prisma.Prisma__SearchQueryClient<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SearchQueryCountArgs>(args?: Prisma.Subset<T, SearchQueryCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SearchQueryCountAggregateOutputType> : number>;
    aggregate<T extends SearchQueryAggregateArgs>(args: Prisma.Subset<T, SearchQueryAggregateArgs>): Prisma.PrismaPromise<GetSearchQueryAggregateType<T>>;
    groupBy<T extends SearchQueryGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SearchQueryGroupByArgs['orderBy'];
    } : {
        orderBy?: SearchQueryGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SearchQueryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSearchQueryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SearchQueryFieldRefs;
}
export interface Prisma__SearchQueryClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    opportunityFeed<T extends Prisma.OpportunityFeedDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OpportunityFeedDefaultArgs<ExtArgs>>): Prisma.Prisma__OpportunityFeedClient<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    opportunitySearchQueries<T extends Prisma.SearchQuery$opportunitySearchQueriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SearchQuery$opportunitySearchQueriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SearchQueryFieldRefs {
    readonly id: Prisma.FieldRef<"SearchQuery", 'String'>;
    readonly opportunityFeedId: Prisma.FieldRef<"SearchQuery", 'String'>;
    readonly query: Prisma.FieldRef<"SearchQuery", 'String'>;
    readonly type: Prisma.FieldRef<"SearchQuery", 'SearchQueryType'>;
    readonly isActive: Prisma.FieldRef<"SearchQuery", 'Boolean'>;
    readonly matchedPosts: Prisma.FieldRef<"SearchQuery", 'Int'>;
    readonly relevantPosts: Prisma.FieldRef<"SearchQuery", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"SearchQuery", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"SearchQuery", 'DateTime'>;
}
export type SearchQueryFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.SearchQueryOmit<ExtArgs> | null;
    include?: Prisma.SearchQueryInclude<ExtArgs> | null;
    where: Prisma.SearchQueryWhereUniqueInput;
};
export type SearchQueryFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.SearchQueryOmit<ExtArgs> | null;
    include?: Prisma.SearchQueryInclude<ExtArgs> | null;
    where: Prisma.SearchQueryWhereUniqueInput;
};
export type SearchQueryFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type SearchQueryFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type SearchQueryFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type SearchQueryCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.SearchQueryOmit<ExtArgs> | null;
    include?: Prisma.SearchQueryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SearchQueryCreateInput, Prisma.SearchQueryUncheckedCreateInput>;
};
export type SearchQueryCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SearchQueryCreateManyInput | Prisma.SearchQueryCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SearchQueryCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQuerySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SearchQueryOmit<ExtArgs> | null;
    data: Prisma.SearchQueryCreateManyInput | Prisma.SearchQueryCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SearchQueryIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SearchQueryUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.SearchQueryOmit<ExtArgs> | null;
    include?: Prisma.SearchQueryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SearchQueryUpdateInput, Prisma.SearchQueryUncheckedUpdateInput>;
    where: Prisma.SearchQueryWhereUniqueInput;
};
export type SearchQueryUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SearchQueryUpdateManyMutationInput, Prisma.SearchQueryUncheckedUpdateManyInput>;
    where?: Prisma.SearchQueryWhereInput;
    limit?: number;
};
export type SearchQueryUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQuerySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SearchQueryOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SearchQueryUpdateManyMutationInput, Prisma.SearchQueryUncheckedUpdateManyInput>;
    where?: Prisma.SearchQueryWhereInput;
    limit?: number;
    include?: Prisma.SearchQueryIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SearchQueryUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.SearchQueryOmit<ExtArgs> | null;
    include?: Prisma.SearchQueryInclude<ExtArgs> | null;
    where: Prisma.SearchQueryWhereUniqueInput;
    create: Prisma.XOR<Prisma.SearchQueryCreateInput, Prisma.SearchQueryUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SearchQueryUpdateInput, Prisma.SearchQueryUncheckedUpdateInput>;
};
export type SearchQueryDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.SearchQueryOmit<ExtArgs> | null;
    include?: Prisma.SearchQueryInclude<ExtArgs> | null;
    where: Prisma.SearchQueryWhereUniqueInput;
};
export type SearchQueryDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SearchQueryWhereInput;
    limit?: number;
};
export type SearchQuery$opportunitySearchQueriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.OpportunitySearchQueryOmit<ExtArgs> | null;
    include?: Prisma.OpportunitySearchQueryInclude<ExtArgs> | null;
    where?: Prisma.OpportunitySearchQueryWhereInput;
    orderBy?: Prisma.OpportunitySearchQueryOrderByWithRelationInput | Prisma.OpportunitySearchQueryOrderByWithRelationInput[];
    cursor?: Prisma.OpportunitySearchQueryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OpportunitySearchQueryScalarFieldEnum | Prisma.OpportunitySearchQueryScalarFieldEnum[];
};
export type SearchQueryDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.SearchQueryOmit<ExtArgs> | null;
    include?: Prisma.SearchQueryInclude<ExtArgs> | null;
};
