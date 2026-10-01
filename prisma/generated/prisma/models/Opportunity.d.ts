import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type OpportunityModel = runtime.Types.Result.DefaultSelection<Prisma.$OpportunityPayload>;
export type AggregateOpportunity = {
    _count: OpportunityCountAggregateOutputType | null;
    _avg: OpportunityAvgAggregateOutputType | null;
    _sum: OpportunitySumAggregateOutputType | null;
    _min: OpportunityMinAggregateOutputType | null;
    _max: OpportunityMaxAggregateOutputType | null;
};
export type OpportunityAvgAggregateOutputType = {
    score: number | null;
};
export type OpportunitySumAggregateOutputType = {
    score: number | null;
};
export type OpportunityMinAggregateOutputType = {
    id: string | null;
    opportunityFeedId: string | null;
    externalPostId: string | null;
    authorUsername: string | null;
    text: string | null;
    permalink: string | null;
    publishedAt: Date | null;
    score: number | null;
    reason: string | null;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type OpportunityMaxAggregateOutputType = {
    id: string | null;
    opportunityFeedId: string | null;
    externalPostId: string | null;
    authorUsername: string | null;
    text: string | null;
    permalink: string | null;
    publishedAt: Date | null;
    score: number | null;
    reason: string | null;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type OpportunityCountAggregateOutputType = {
    id: number;
    opportunityFeedId: number;
    externalPostId: number;
    authorUsername: number;
    text: number;
    permalink: number;
    publishedAt: number;
    score: number;
    reason: number;
    status: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type OpportunityAvgAggregateInputType = {
    score?: true;
};
export type OpportunitySumAggregateInputType = {
    score?: true;
};
export type OpportunityMinAggregateInputType = {
    id?: true;
    opportunityFeedId?: true;
    externalPostId?: true;
    authorUsername?: true;
    text?: true;
    permalink?: true;
    publishedAt?: true;
    score?: true;
    reason?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type OpportunityMaxAggregateInputType = {
    id?: true;
    opportunityFeedId?: true;
    externalPostId?: true;
    authorUsername?: true;
    text?: true;
    permalink?: true;
    publishedAt?: true;
    score?: true;
    reason?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type OpportunityCountAggregateInputType = {
    id?: true;
    opportunityFeedId?: true;
    externalPostId?: true;
    authorUsername?: true;
    text?: true;
    permalink?: true;
    publishedAt?: true;
    score?: true;
    reason?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type OpportunityAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunityWhereInput;
    orderBy?: Prisma.OpportunityOrderByWithRelationInput | Prisma.OpportunityOrderByWithRelationInput[];
    cursor?: Prisma.OpportunityWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | OpportunityCountAggregateInputType;
    _avg?: OpportunityAvgAggregateInputType;
    _sum?: OpportunitySumAggregateInputType;
    _min?: OpportunityMinAggregateInputType;
    _max?: OpportunityMaxAggregateInputType;
};
export type GetOpportunityAggregateType<T extends OpportunityAggregateArgs> = {
    [P in keyof T & keyof AggregateOpportunity]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateOpportunity[P]> : Prisma.GetScalarType<T[P], AggregateOpportunity[P]>;
};
export type OpportunityGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunityWhereInput;
    orderBy?: Prisma.OpportunityOrderByWithAggregationInput | Prisma.OpportunityOrderByWithAggregationInput[];
    by: Prisma.OpportunityScalarFieldEnum[] | Prisma.OpportunityScalarFieldEnum;
    having?: Prisma.OpportunityScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OpportunityCountAggregateInputType | true;
    _avg?: OpportunityAvgAggregateInputType;
    _sum?: OpportunitySumAggregateInputType;
    _min?: OpportunityMinAggregateInputType;
    _max?: OpportunityMaxAggregateInputType;
};
export type OpportunityGroupByOutputType = {
    id: string;
    opportunityFeedId: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date;
    score: number;
    reason: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    _count: OpportunityCountAggregateOutputType | null;
    _avg: OpportunityAvgAggregateOutputType | null;
    _sum: OpportunitySumAggregateOutputType | null;
    _min: OpportunityMinAggregateOutputType | null;
    _max: OpportunityMaxAggregateOutputType | null;
};
export type GetOpportunityGroupByPayload<T extends OpportunityGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<OpportunityGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof OpportunityGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], OpportunityGroupByOutputType[P]> : Prisma.GetScalarType<T[P], OpportunityGroupByOutputType[P]>;
}>>;
export type OpportunityWhereInput = {
    AND?: Prisma.OpportunityWhereInput | Prisma.OpportunityWhereInput[];
    OR?: Prisma.OpportunityWhereInput[];
    NOT?: Prisma.OpportunityWhereInput | Prisma.OpportunityWhereInput[];
    id?: Prisma.UuidFilter<"Opportunity"> | string;
    opportunityFeedId?: Prisma.UuidFilter<"Opportunity"> | string;
    externalPostId?: Prisma.StringFilter<"Opportunity"> | string;
    authorUsername?: Prisma.StringFilter<"Opportunity"> | string;
    text?: Prisma.StringFilter<"Opportunity"> | string;
    permalink?: Prisma.StringFilter<"Opportunity"> | string;
    publishedAt?: Prisma.DateTimeFilter<"Opportunity"> | Date | string;
    score?: Prisma.IntFilter<"Opportunity"> | number;
    reason?: Prisma.StringFilter<"Opportunity"> | string;
    status?: Prisma.StringFilter<"Opportunity"> | string;
    createdAt?: Prisma.DateTimeFilter<"Opportunity"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Opportunity"> | Date | string;
    opportunityFeed?: Prisma.XOR<Prisma.OpportunityFeedScalarRelationFilter, Prisma.OpportunityFeedWhereInput>;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryListRelationFilter;
};
export type OpportunityOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    opportunityFeedId?: Prisma.SortOrder;
    externalPostId?: Prisma.SortOrder;
    authorUsername?: Prisma.SortOrder;
    text?: Prisma.SortOrder;
    permalink?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    score?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    opportunityFeed?: Prisma.OpportunityFeedOrderByWithRelationInput;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryOrderByRelationAggregateInput;
};
export type OpportunityWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.OpportunityWhereInput | Prisma.OpportunityWhereInput[];
    OR?: Prisma.OpportunityWhereInput[];
    NOT?: Prisma.OpportunityWhereInput | Prisma.OpportunityWhereInput[];
    opportunityFeedId?: Prisma.UuidFilter<"Opportunity"> | string;
    externalPostId?: Prisma.StringFilter<"Opportunity"> | string;
    authorUsername?: Prisma.StringFilter<"Opportunity"> | string;
    text?: Prisma.StringFilter<"Opportunity"> | string;
    permalink?: Prisma.StringFilter<"Opportunity"> | string;
    publishedAt?: Prisma.DateTimeFilter<"Opportunity"> | Date | string;
    score?: Prisma.IntFilter<"Opportunity"> | number;
    reason?: Prisma.StringFilter<"Opportunity"> | string;
    status?: Prisma.StringFilter<"Opportunity"> | string;
    createdAt?: Prisma.DateTimeFilter<"Opportunity"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Opportunity"> | Date | string;
    opportunityFeed?: Prisma.XOR<Prisma.OpportunityFeedScalarRelationFilter, Prisma.OpportunityFeedWhereInput>;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryListRelationFilter;
}, "id">;
export type OpportunityOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    opportunityFeedId?: Prisma.SortOrder;
    externalPostId?: Prisma.SortOrder;
    authorUsername?: Prisma.SortOrder;
    text?: Prisma.SortOrder;
    permalink?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    score?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.OpportunityCountOrderByAggregateInput;
    _avg?: Prisma.OpportunityAvgOrderByAggregateInput;
    _max?: Prisma.OpportunityMaxOrderByAggregateInput;
    _min?: Prisma.OpportunityMinOrderByAggregateInput;
    _sum?: Prisma.OpportunitySumOrderByAggregateInput;
};
export type OpportunityScalarWhereWithAggregatesInput = {
    AND?: Prisma.OpportunityScalarWhereWithAggregatesInput | Prisma.OpportunityScalarWhereWithAggregatesInput[];
    OR?: Prisma.OpportunityScalarWhereWithAggregatesInput[];
    NOT?: Prisma.OpportunityScalarWhereWithAggregatesInput | Prisma.OpportunityScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Opportunity"> | string;
    opportunityFeedId?: Prisma.UuidWithAggregatesFilter<"Opportunity"> | string;
    externalPostId?: Prisma.StringWithAggregatesFilter<"Opportunity"> | string;
    authorUsername?: Prisma.StringWithAggregatesFilter<"Opportunity"> | string;
    text?: Prisma.StringWithAggregatesFilter<"Opportunity"> | string;
    permalink?: Prisma.StringWithAggregatesFilter<"Opportunity"> | string;
    publishedAt?: Prisma.DateTimeWithAggregatesFilter<"Opportunity"> | Date | string;
    score?: Prisma.IntWithAggregatesFilter<"Opportunity"> | number;
    reason?: Prisma.StringWithAggregatesFilter<"Opportunity"> | string;
    status?: Prisma.StringWithAggregatesFilter<"Opportunity"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Opportunity"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Opportunity"> | Date | string;
};
export type OpportunityCreateInput = {
    id?: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date | string;
    score: number;
    reason: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunityFeed: Prisma.OpportunityFeedCreateNestedOneWithoutOpportunitiesInput;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryCreateNestedManyWithoutOpportunityInput;
};
export type OpportunityUncheckedCreateInput = {
    id?: string;
    opportunityFeedId: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date | string;
    score: number;
    reason: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUncheckedCreateNestedManyWithoutOpportunityInput;
};
export type OpportunityUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    externalPostId?: Prisma.StringFieldUpdateOperationsInput | string;
    authorUsername?: Prisma.StringFieldUpdateOperationsInput | string;
    text?: Prisma.StringFieldUpdateOperationsInput | string;
    permalink?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    reason?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunityFeed?: Prisma.OpportunityFeedUpdateOneRequiredWithoutOpportunitiesNestedInput;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUpdateManyWithoutOpportunityNestedInput;
};
export type OpportunityUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    opportunityFeedId?: Prisma.StringFieldUpdateOperationsInput | string;
    externalPostId?: Prisma.StringFieldUpdateOperationsInput | string;
    authorUsername?: Prisma.StringFieldUpdateOperationsInput | string;
    text?: Prisma.StringFieldUpdateOperationsInput | string;
    permalink?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    reason?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUncheckedUpdateManyWithoutOpportunityNestedInput;
};
export type OpportunityCreateManyInput = {
    id?: string;
    opportunityFeedId: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date | string;
    score: number;
    reason: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type OpportunityUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    externalPostId?: Prisma.StringFieldUpdateOperationsInput | string;
    authorUsername?: Prisma.StringFieldUpdateOperationsInput | string;
    text?: Prisma.StringFieldUpdateOperationsInput | string;
    permalink?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    reason?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunityUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    opportunityFeedId?: Prisma.StringFieldUpdateOperationsInput | string;
    externalPostId?: Prisma.StringFieldUpdateOperationsInput | string;
    authorUsername?: Prisma.StringFieldUpdateOperationsInput | string;
    text?: Prisma.StringFieldUpdateOperationsInput | string;
    permalink?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    reason?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunityListRelationFilter = {
    every?: Prisma.OpportunityWhereInput;
    some?: Prisma.OpportunityWhereInput;
    none?: Prisma.OpportunityWhereInput;
};
export type OpportunityOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type OpportunityScalarRelationFilter = {
    is?: Prisma.OpportunityWhereInput;
    isNot?: Prisma.OpportunityWhereInput;
};
export type OpportunityCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    opportunityFeedId?: Prisma.SortOrder;
    externalPostId?: Prisma.SortOrder;
    authorUsername?: Prisma.SortOrder;
    text?: Prisma.SortOrder;
    permalink?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    score?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type OpportunityAvgOrderByAggregateInput = {
    score?: Prisma.SortOrder;
};
export type OpportunityMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    opportunityFeedId?: Prisma.SortOrder;
    externalPostId?: Prisma.SortOrder;
    authorUsername?: Prisma.SortOrder;
    text?: Prisma.SortOrder;
    permalink?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    score?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type OpportunityMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    opportunityFeedId?: Prisma.SortOrder;
    externalPostId?: Prisma.SortOrder;
    authorUsername?: Prisma.SortOrder;
    text?: Prisma.SortOrder;
    permalink?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    score?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type OpportunitySumOrderByAggregateInput = {
    score?: Prisma.SortOrder;
};
export type OpportunityCreateNestedManyWithoutOpportunityFeedInput = {
    create?: Prisma.XOR<Prisma.OpportunityCreateWithoutOpportunityFeedInput, Prisma.OpportunityUncheckedCreateWithoutOpportunityFeedInput> | Prisma.OpportunityCreateWithoutOpportunityFeedInput[] | Prisma.OpportunityUncheckedCreateWithoutOpportunityFeedInput[];
    connectOrCreate?: Prisma.OpportunityCreateOrConnectWithoutOpportunityFeedInput | Prisma.OpportunityCreateOrConnectWithoutOpportunityFeedInput[];
    createMany?: Prisma.OpportunityCreateManyOpportunityFeedInputEnvelope;
    connect?: Prisma.OpportunityWhereUniqueInput | Prisma.OpportunityWhereUniqueInput[];
};
export type OpportunityUncheckedCreateNestedManyWithoutOpportunityFeedInput = {
    create?: Prisma.XOR<Prisma.OpportunityCreateWithoutOpportunityFeedInput, Prisma.OpportunityUncheckedCreateWithoutOpportunityFeedInput> | Prisma.OpportunityCreateWithoutOpportunityFeedInput[] | Prisma.OpportunityUncheckedCreateWithoutOpportunityFeedInput[];
    connectOrCreate?: Prisma.OpportunityCreateOrConnectWithoutOpportunityFeedInput | Prisma.OpportunityCreateOrConnectWithoutOpportunityFeedInput[];
    createMany?: Prisma.OpportunityCreateManyOpportunityFeedInputEnvelope;
    connect?: Prisma.OpportunityWhereUniqueInput | Prisma.OpportunityWhereUniqueInput[];
};
export type OpportunityUpdateManyWithoutOpportunityFeedNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunityCreateWithoutOpportunityFeedInput, Prisma.OpportunityUncheckedCreateWithoutOpportunityFeedInput> | Prisma.OpportunityCreateWithoutOpportunityFeedInput[] | Prisma.OpportunityUncheckedCreateWithoutOpportunityFeedInput[];
    connectOrCreate?: Prisma.OpportunityCreateOrConnectWithoutOpportunityFeedInput | Prisma.OpportunityCreateOrConnectWithoutOpportunityFeedInput[];
    upsert?: Prisma.OpportunityUpsertWithWhereUniqueWithoutOpportunityFeedInput | Prisma.OpportunityUpsertWithWhereUniqueWithoutOpportunityFeedInput[];
    createMany?: Prisma.OpportunityCreateManyOpportunityFeedInputEnvelope;
    set?: Prisma.OpportunityWhereUniqueInput | Prisma.OpportunityWhereUniqueInput[];
    disconnect?: Prisma.OpportunityWhereUniqueInput | Prisma.OpportunityWhereUniqueInput[];
    delete?: Prisma.OpportunityWhereUniqueInput | Prisma.OpportunityWhereUniqueInput[];
    connect?: Prisma.OpportunityWhereUniqueInput | Prisma.OpportunityWhereUniqueInput[];
    update?: Prisma.OpportunityUpdateWithWhereUniqueWithoutOpportunityFeedInput | Prisma.OpportunityUpdateWithWhereUniqueWithoutOpportunityFeedInput[];
    updateMany?: Prisma.OpportunityUpdateManyWithWhereWithoutOpportunityFeedInput | Prisma.OpportunityUpdateManyWithWhereWithoutOpportunityFeedInput[];
    deleteMany?: Prisma.OpportunityScalarWhereInput | Prisma.OpportunityScalarWhereInput[];
};
export type OpportunityUncheckedUpdateManyWithoutOpportunityFeedNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunityCreateWithoutOpportunityFeedInput, Prisma.OpportunityUncheckedCreateWithoutOpportunityFeedInput> | Prisma.OpportunityCreateWithoutOpportunityFeedInput[] | Prisma.OpportunityUncheckedCreateWithoutOpportunityFeedInput[];
    connectOrCreate?: Prisma.OpportunityCreateOrConnectWithoutOpportunityFeedInput | Prisma.OpportunityCreateOrConnectWithoutOpportunityFeedInput[];
    upsert?: Prisma.OpportunityUpsertWithWhereUniqueWithoutOpportunityFeedInput | Prisma.OpportunityUpsertWithWhereUniqueWithoutOpportunityFeedInput[];
    createMany?: Prisma.OpportunityCreateManyOpportunityFeedInputEnvelope;
    set?: Prisma.OpportunityWhereUniqueInput | Prisma.OpportunityWhereUniqueInput[];
    disconnect?: Prisma.OpportunityWhereUniqueInput | Prisma.OpportunityWhereUniqueInput[];
    delete?: Prisma.OpportunityWhereUniqueInput | Prisma.OpportunityWhereUniqueInput[];
    connect?: Prisma.OpportunityWhereUniqueInput | Prisma.OpportunityWhereUniqueInput[];
    update?: Prisma.OpportunityUpdateWithWhereUniqueWithoutOpportunityFeedInput | Prisma.OpportunityUpdateWithWhereUniqueWithoutOpportunityFeedInput[];
    updateMany?: Prisma.OpportunityUpdateManyWithWhereWithoutOpportunityFeedInput | Prisma.OpportunityUpdateManyWithWhereWithoutOpportunityFeedInput[];
    deleteMany?: Prisma.OpportunityScalarWhereInput | Prisma.OpportunityScalarWhereInput[];
};
export type OpportunityCreateNestedOneWithoutOpportunitySearchQueriesInput = {
    create?: Prisma.XOR<Prisma.OpportunityCreateWithoutOpportunitySearchQueriesInput, Prisma.OpportunityUncheckedCreateWithoutOpportunitySearchQueriesInput>;
    connectOrCreate?: Prisma.OpportunityCreateOrConnectWithoutOpportunitySearchQueriesInput;
    connect?: Prisma.OpportunityWhereUniqueInput;
};
export type OpportunityUpdateOneRequiredWithoutOpportunitySearchQueriesNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunityCreateWithoutOpportunitySearchQueriesInput, Prisma.OpportunityUncheckedCreateWithoutOpportunitySearchQueriesInput>;
    connectOrCreate?: Prisma.OpportunityCreateOrConnectWithoutOpportunitySearchQueriesInput;
    upsert?: Prisma.OpportunityUpsertWithoutOpportunitySearchQueriesInput;
    connect?: Prisma.OpportunityWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OpportunityUpdateToOneWithWhereWithoutOpportunitySearchQueriesInput, Prisma.OpportunityUpdateWithoutOpportunitySearchQueriesInput>, Prisma.OpportunityUncheckedUpdateWithoutOpportunitySearchQueriesInput>;
};
export type OpportunityCreateWithoutOpportunityFeedInput = {
    id?: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date | string;
    score: number;
    reason: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryCreateNestedManyWithoutOpportunityInput;
};
export type OpportunityUncheckedCreateWithoutOpportunityFeedInput = {
    id?: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date | string;
    score: number;
    reason: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUncheckedCreateNestedManyWithoutOpportunityInput;
};
export type OpportunityCreateOrConnectWithoutOpportunityFeedInput = {
    where: Prisma.OpportunityWhereUniqueInput;
    create: Prisma.XOR<Prisma.OpportunityCreateWithoutOpportunityFeedInput, Prisma.OpportunityUncheckedCreateWithoutOpportunityFeedInput>;
};
export type OpportunityCreateManyOpportunityFeedInputEnvelope = {
    data: Prisma.OpportunityCreateManyOpportunityFeedInput | Prisma.OpportunityCreateManyOpportunityFeedInput[];
    skipDuplicates?: boolean;
};
export type OpportunityUpsertWithWhereUniqueWithoutOpportunityFeedInput = {
    where: Prisma.OpportunityWhereUniqueInput;
    update: Prisma.XOR<Prisma.OpportunityUpdateWithoutOpportunityFeedInput, Prisma.OpportunityUncheckedUpdateWithoutOpportunityFeedInput>;
    create: Prisma.XOR<Prisma.OpportunityCreateWithoutOpportunityFeedInput, Prisma.OpportunityUncheckedCreateWithoutOpportunityFeedInput>;
};
export type OpportunityUpdateWithWhereUniqueWithoutOpportunityFeedInput = {
    where: Prisma.OpportunityWhereUniqueInput;
    data: Prisma.XOR<Prisma.OpportunityUpdateWithoutOpportunityFeedInput, Prisma.OpportunityUncheckedUpdateWithoutOpportunityFeedInput>;
};
export type OpportunityUpdateManyWithWhereWithoutOpportunityFeedInput = {
    where: Prisma.OpportunityScalarWhereInput;
    data: Prisma.XOR<Prisma.OpportunityUpdateManyMutationInput, Prisma.OpportunityUncheckedUpdateManyWithoutOpportunityFeedInput>;
};
export type OpportunityScalarWhereInput = {
    AND?: Prisma.OpportunityScalarWhereInput | Prisma.OpportunityScalarWhereInput[];
    OR?: Prisma.OpportunityScalarWhereInput[];
    NOT?: Prisma.OpportunityScalarWhereInput | Prisma.OpportunityScalarWhereInput[];
    id?: Prisma.UuidFilter<"Opportunity"> | string;
    opportunityFeedId?: Prisma.UuidFilter<"Opportunity"> | string;
    externalPostId?: Prisma.StringFilter<"Opportunity"> | string;
    authorUsername?: Prisma.StringFilter<"Opportunity"> | string;
    text?: Prisma.StringFilter<"Opportunity"> | string;
    permalink?: Prisma.StringFilter<"Opportunity"> | string;
    publishedAt?: Prisma.DateTimeFilter<"Opportunity"> | Date | string;
    score?: Prisma.IntFilter<"Opportunity"> | number;
    reason?: Prisma.StringFilter<"Opportunity"> | string;
    status?: Prisma.StringFilter<"Opportunity"> | string;
    createdAt?: Prisma.DateTimeFilter<"Opportunity"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Opportunity"> | Date | string;
};
export type OpportunityCreateWithoutOpportunitySearchQueriesInput = {
    id?: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date | string;
    score: number;
    reason: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    opportunityFeed: Prisma.OpportunityFeedCreateNestedOneWithoutOpportunitiesInput;
};
export type OpportunityUncheckedCreateWithoutOpportunitySearchQueriesInput = {
    id?: string;
    opportunityFeedId: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date | string;
    score: number;
    reason: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type OpportunityCreateOrConnectWithoutOpportunitySearchQueriesInput = {
    where: Prisma.OpportunityWhereUniqueInput;
    create: Prisma.XOR<Prisma.OpportunityCreateWithoutOpportunitySearchQueriesInput, Prisma.OpportunityUncheckedCreateWithoutOpportunitySearchQueriesInput>;
};
export type OpportunityUpsertWithoutOpportunitySearchQueriesInput = {
    update: Prisma.XOR<Prisma.OpportunityUpdateWithoutOpportunitySearchQueriesInput, Prisma.OpportunityUncheckedUpdateWithoutOpportunitySearchQueriesInput>;
    create: Prisma.XOR<Prisma.OpportunityCreateWithoutOpportunitySearchQueriesInput, Prisma.OpportunityUncheckedCreateWithoutOpportunitySearchQueriesInput>;
    where?: Prisma.OpportunityWhereInput;
};
export type OpportunityUpdateToOneWithWhereWithoutOpportunitySearchQueriesInput = {
    where?: Prisma.OpportunityWhereInput;
    data: Prisma.XOR<Prisma.OpportunityUpdateWithoutOpportunitySearchQueriesInput, Prisma.OpportunityUncheckedUpdateWithoutOpportunitySearchQueriesInput>;
};
export type OpportunityUpdateWithoutOpportunitySearchQueriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    externalPostId?: Prisma.StringFieldUpdateOperationsInput | string;
    authorUsername?: Prisma.StringFieldUpdateOperationsInput | string;
    text?: Prisma.StringFieldUpdateOperationsInput | string;
    permalink?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    reason?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunityFeed?: Prisma.OpportunityFeedUpdateOneRequiredWithoutOpportunitiesNestedInput;
};
export type OpportunityUncheckedUpdateWithoutOpportunitySearchQueriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    opportunityFeedId?: Prisma.StringFieldUpdateOperationsInput | string;
    externalPostId?: Prisma.StringFieldUpdateOperationsInput | string;
    authorUsername?: Prisma.StringFieldUpdateOperationsInput | string;
    text?: Prisma.StringFieldUpdateOperationsInput | string;
    permalink?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    reason?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunityCreateManyOpportunityFeedInput = {
    id?: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date | string;
    score: number;
    reason: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type OpportunityUpdateWithoutOpportunityFeedInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    externalPostId?: Prisma.StringFieldUpdateOperationsInput | string;
    authorUsername?: Prisma.StringFieldUpdateOperationsInput | string;
    text?: Prisma.StringFieldUpdateOperationsInput | string;
    permalink?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    reason?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUpdateManyWithoutOpportunityNestedInput;
};
export type OpportunityUncheckedUpdateWithoutOpportunityFeedInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    externalPostId?: Prisma.StringFieldUpdateOperationsInput | string;
    authorUsername?: Prisma.StringFieldUpdateOperationsInput | string;
    text?: Prisma.StringFieldUpdateOperationsInput | string;
    permalink?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    reason?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunitySearchQueries?: Prisma.OpportunitySearchQueryUncheckedUpdateManyWithoutOpportunityNestedInput;
};
export type OpportunityUncheckedUpdateManyWithoutOpportunityFeedInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    externalPostId?: Prisma.StringFieldUpdateOperationsInput | string;
    authorUsername?: Prisma.StringFieldUpdateOperationsInput | string;
    text?: Prisma.StringFieldUpdateOperationsInput | string;
    permalink?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    reason?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunityCountOutputType = {
    opportunitySearchQueries: number;
};
export type OpportunityCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunitySearchQueries?: boolean | OpportunityCountOutputTypeCountOpportunitySearchQueriesArgs;
};
export type OpportunityCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunityCountOutputTypeSelect<ExtArgs> | null;
};
export type OpportunityCountOutputTypeCountOpportunitySearchQueriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunitySearchQueryWhereInput;
};
export type OpportunitySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    opportunityFeedId?: boolean;
    externalPostId?: boolean;
    authorUsername?: boolean;
    text?: boolean;
    permalink?: boolean;
    publishedAt?: boolean;
    score?: boolean;
    reason?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
    opportunitySearchQueries?: boolean | Prisma.Opportunity$opportunitySearchQueriesArgs<ExtArgs>;
    _count?: boolean | Prisma.OpportunityCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["opportunity"]>;
export type OpportunitySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    opportunityFeedId?: boolean;
    externalPostId?: boolean;
    authorUsername?: boolean;
    text?: boolean;
    permalink?: boolean;
    publishedAt?: boolean;
    score?: boolean;
    reason?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["opportunity"]>;
export type OpportunitySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    opportunityFeedId?: boolean;
    externalPostId?: boolean;
    authorUsername?: boolean;
    text?: boolean;
    permalink?: boolean;
    publishedAt?: boolean;
    score?: boolean;
    reason?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["opportunity"]>;
export type OpportunitySelectScalar = {
    id?: boolean;
    opportunityFeedId?: boolean;
    externalPostId?: boolean;
    authorUsername?: boolean;
    text?: boolean;
    permalink?: boolean;
    publishedAt?: boolean;
    score?: boolean;
    reason?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type OpportunityOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "opportunityFeedId" | "externalPostId" | "authorUsername" | "text" | "permalink" | "publishedAt" | "score" | "reason" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["opportunity"]>;
export type OpportunityInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
    opportunitySearchQueries?: boolean | Prisma.Opportunity$opportunitySearchQueriesArgs<ExtArgs>;
    _count?: boolean | Prisma.OpportunityCountOutputTypeDefaultArgs<ExtArgs>;
};
export type OpportunityIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
};
export type OpportunityIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunityFeed?: boolean | Prisma.OpportunityFeedDefaultArgs<ExtArgs>;
};
export type $OpportunityPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Opportunity";
    objects: {
        opportunityFeed: Prisma.$OpportunityFeedPayload<ExtArgs>;
        opportunitySearchQueries: Prisma.$OpportunitySearchQueryPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        opportunityFeedId: string;
        externalPostId: string;
        authorUsername: string;
        text: string;
        permalink: string;
        publishedAt: Date;
        score: number;
        reason: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["opportunity"]>;
    composites: {};
};
export type OpportunityGetPayload<S extends boolean | null | undefined | OpportunityDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$OpportunityPayload, S>;
export type OpportunityCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<OpportunityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: OpportunityCountAggregateInputType | true;
};
export interface OpportunityDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Opportunity'];
        meta: {
            name: 'Opportunity';
        };
    };
    findUnique<T extends OpportunityFindUniqueArgs>(args: Prisma.SelectSubset<T, OpportunityFindUniqueArgs<ExtArgs>>): Prisma.Prisma__OpportunityClient<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends OpportunityFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, OpportunityFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__OpportunityClient<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends OpportunityFindFirstArgs>(args?: Prisma.SelectSubset<T, OpportunityFindFirstArgs<ExtArgs>>): Prisma.Prisma__OpportunityClient<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends OpportunityFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, OpportunityFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__OpportunityClient<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends OpportunityFindManyArgs>(args?: Prisma.SelectSubset<T, OpportunityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends OpportunityCreateArgs>(args: Prisma.SelectSubset<T, OpportunityCreateArgs<ExtArgs>>): Prisma.Prisma__OpportunityClient<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends OpportunityCreateManyArgs>(args?: Prisma.SelectSubset<T, OpportunityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends OpportunityCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, OpportunityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends OpportunityDeleteArgs>(args: Prisma.SelectSubset<T, OpportunityDeleteArgs<ExtArgs>>): Prisma.Prisma__OpportunityClient<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends OpportunityUpdateArgs>(args: Prisma.SelectSubset<T, OpportunityUpdateArgs<ExtArgs>>): Prisma.Prisma__OpportunityClient<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends OpportunityDeleteManyArgs>(args?: Prisma.SelectSubset<T, OpportunityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends OpportunityUpdateManyArgs>(args: Prisma.SelectSubset<T, OpportunityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends OpportunityUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, OpportunityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends OpportunityUpsertArgs>(args: Prisma.SelectSubset<T, OpportunityUpsertArgs<ExtArgs>>): Prisma.Prisma__OpportunityClient<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends OpportunityCountArgs>(args?: Prisma.Subset<T, OpportunityCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], OpportunityCountAggregateOutputType> : number>;
    aggregate<T extends OpportunityAggregateArgs>(args: Prisma.Subset<T, OpportunityAggregateArgs>): Prisma.PrismaPromise<GetOpportunityAggregateType<T>>;
    groupBy<T extends OpportunityGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: OpportunityGroupByArgs['orderBy'];
    } : {
        orderBy?: OpportunityGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, OpportunityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOpportunityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: OpportunityFieldRefs;
}
export interface Prisma__OpportunityClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    opportunityFeed<T extends Prisma.OpportunityFeedDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OpportunityFeedDefaultArgs<ExtArgs>>): Prisma.Prisma__OpportunityFeedClient<runtime.Types.Result.GetResult<Prisma.$OpportunityFeedPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    opportunitySearchQueries<T extends Prisma.Opportunity$opportunitySearchQueriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Opportunity$opportunitySearchQueriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface OpportunityFieldRefs {
    readonly id: Prisma.FieldRef<"Opportunity", 'String'>;
    readonly opportunityFeedId: Prisma.FieldRef<"Opportunity", 'String'>;
    readonly externalPostId: Prisma.FieldRef<"Opportunity", 'String'>;
    readonly authorUsername: Prisma.FieldRef<"Opportunity", 'String'>;
    readonly text: Prisma.FieldRef<"Opportunity", 'String'>;
    readonly permalink: Prisma.FieldRef<"Opportunity", 'String'>;
    readonly publishedAt: Prisma.FieldRef<"Opportunity", 'DateTime'>;
    readonly score: Prisma.FieldRef<"Opportunity", 'Int'>;
    readonly reason: Prisma.FieldRef<"Opportunity", 'String'>;
    readonly status: Prisma.FieldRef<"Opportunity", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Opportunity", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Opportunity", 'DateTime'>;
}
export type OpportunityFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySelect<ExtArgs> | null;
    omit?: Prisma.OpportunityOmit<ExtArgs> | null;
    include?: Prisma.OpportunityInclude<ExtArgs> | null;
    where: Prisma.OpportunityWhereUniqueInput;
};
export type OpportunityFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySelect<ExtArgs> | null;
    omit?: Prisma.OpportunityOmit<ExtArgs> | null;
    include?: Prisma.OpportunityInclude<ExtArgs> | null;
    where: Prisma.OpportunityWhereUniqueInput;
};
export type OpportunityFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type OpportunityFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type OpportunityFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type OpportunityCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySelect<ExtArgs> | null;
    omit?: Prisma.OpportunityOmit<ExtArgs> | null;
    include?: Prisma.OpportunityInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OpportunityCreateInput, Prisma.OpportunityUncheckedCreateInput>;
};
export type OpportunityCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.OpportunityCreateManyInput | Prisma.OpportunityCreateManyInput[];
    skipDuplicates?: boolean;
};
export type OpportunityCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OpportunityOmit<ExtArgs> | null;
    data: Prisma.OpportunityCreateManyInput | Prisma.OpportunityCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.OpportunityIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type OpportunityUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySelect<ExtArgs> | null;
    omit?: Prisma.OpportunityOmit<ExtArgs> | null;
    include?: Prisma.OpportunityInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OpportunityUpdateInput, Prisma.OpportunityUncheckedUpdateInput>;
    where: Prisma.OpportunityWhereUniqueInput;
};
export type OpportunityUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.OpportunityUpdateManyMutationInput, Prisma.OpportunityUncheckedUpdateManyInput>;
    where?: Prisma.OpportunityWhereInput;
    limit?: number;
};
export type OpportunityUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OpportunityOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OpportunityUpdateManyMutationInput, Prisma.OpportunityUncheckedUpdateManyInput>;
    where?: Prisma.OpportunityWhereInput;
    limit?: number;
    include?: Prisma.OpportunityIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type OpportunityUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySelect<ExtArgs> | null;
    omit?: Prisma.OpportunityOmit<ExtArgs> | null;
    include?: Prisma.OpportunityInclude<ExtArgs> | null;
    where: Prisma.OpportunityWhereUniqueInput;
    create: Prisma.XOR<Prisma.OpportunityCreateInput, Prisma.OpportunityUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.OpportunityUpdateInput, Prisma.OpportunityUncheckedUpdateInput>;
};
export type OpportunityDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySelect<ExtArgs> | null;
    omit?: Prisma.OpportunityOmit<ExtArgs> | null;
    include?: Prisma.OpportunityInclude<ExtArgs> | null;
    where: Prisma.OpportunityWhereUniqueInput;
};
export type OpportunityDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunityWhereInput;
    limit?: number;
};
export type Opportunity$opportunitySearchQueriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type OpportunityDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySelect<ExtArgs> | null;
    omit?: Prisma.OpportunityOmit<ExtArgs> | null;
    include?: Prisma.OpportunityInclude<ExtArgs> | null;
};
