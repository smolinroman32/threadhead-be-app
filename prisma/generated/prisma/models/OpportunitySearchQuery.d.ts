import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type OpportunitySearchQueryModel = runtime.Types.Result.DefaultSelection<Prisma.$OpportunitySearchQueryPayload>;
export type AggregateOpportunitySearchQuery = {
    _count: OpportunitySearchQueryCountAggregateOutputType | null;
    _min: OpportunitySearchQueryMinAggregateOutputType | null;
    _max: OpportunitySearchQueryMaxAggregateOutputType | null;
};
export type OpportunitySearchQueryMinAggregateOutputType = {
    opportunityId: string | null;
    searchQueryId: string | null;
    createdAt: Date | null;
};
export type OpportunitySearchQueryMaxAggregateOutputType = {
    opportunityId: string | null;
    searchQueryId: string | null;
    createdAt: Date | null;
};
export type OpportunitySearchQueryCountAggregateOutputType = {
    opportunityId: number;
    searchQueryId: number;
    createdAt: number;
    _all: number;
};
export type OpportunitySearchQueryMinAggregateInputType = {
    opportunityId?: true;
    searchQueryId?: true;
    createdAt?: true;
};
export type OpportunitySearchQueryMaxAggregateInputType = {
    opportunityId?: true;
    searchQueryId?: true;
    createdAt?: true;
};
export type OpportunitySearchQueryCountAggregateInputType = {
    opportunityId?: true;
    searchQueryId?: true;
    createdAt?: true;
    _all?: true;
};
export type OpportunitySearchQueryAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunitySearchQueryWhereInput;
    orderBy?: Prisma.OpportunitySearchQueryOrderByWithRelationInput | Prisma.OpportunitySearchQueryOrderByWithRelationInput[];
    cursor?: Prisma.OpportunitySearchQueryWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | OpportunitySearchQueryCountAggregateInputType;
    _min?: OpportunitySearchQueryMinAggregateInputType;
    _max?: OpportunitySearchQueryMaxAggregateInputType;
};
export type GetOpportunitySearchQueryAggregateType<T extends OpportunitySearchQueryAggregateArgs> = {
    [P in keyof T & keyof AggregateOpportunitySearchQuery]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateOpportunitySearchQuery[P]> : Prisma.GetScalarType<T[P], AggregateOpportunitySearchQuery[P]>;
};
export type OpportunitySearchQueryGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunitySearchQueryWhereInput;
    orderBy?: Prisma.OpportunitySearchQueryOrderByWithAggregationInput | Prisma.OpportunitySearchQueryOrderByWithAggregationInput[];
    by: Prisma.OpportunitySearchQueryScalarFieldEnum[] | Prisma.OpportunitySearchQueryScalarFieldEnum;
    having?: Prisma.OpportunitySearchQueryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OpportunitySearchQueryCountAggregateInputType | true;
    _min?: OpportunitySearchQueryMinAggregateInputType;
    _max?: OpportunitySearchQueryMaxAggregateInputType;
};
export type OpportunitySearchQueryGroupByOutputType = {
    opportunityId: string;
    searchQueryId: string;
    createdAt: Date;
    _count: OpportunitySearchQueryCountAggregateOutputType | null;
    _min: OpportunitySearchQueryMinAggregateOutputType | null;
    _max: OpportunitySearchQueryMaxAggregateOutputType | null;
};
export type GetOpportunitySearchQueryGroupByPayload<T extends OpportunitySearchQueryGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<OpportunitySearchQueryGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof OpportunitySearchQueryGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], OpportunitySearchQueryGroupByOutputType[P]> : Prisma.GetScalarType<T[P], OpportunitySearchQueryGroupByOutputType[P]>;
}>>;
export type OpportunitySearchQueryWhereInput = {
    AND?: Prisma.OpportunitySearchQueryWhereInput | Prisma.OpportunitySearchQueryWhereInput[];
    OR?: Prisma.OpportunitySearchQueryWhereInput[];
    NOT?: Prisma.OpportunitySearchQueryWhereInput | Prisma.OpportunitySearchQueryWhereInput[];
    opportunityId?: Prisma.UuidFilter<"OpportunitySearchQuery"> | string;
    searchQueryId?: Prisma.UuidFilter<"OpportunitySearchQuery"> | string;
    createdAt?: Prisma.DateTimeFilter<"OpportunitySearchQuery"> | Date | string;
    opportunity?: Prisma.XOR<Prisma.OpportunityScalarRelationFilter, Prisma.OpportunityWhereInput>;
    searchQuery?: Prisma.XOR<Prisma.SearchQueryScalarRelationFilter, Prisma.SearchQueryWhereInput>;
};
export type OpportunitySearchQueryOrderByWithRelationInput = {
    opportunityId?: Prisma.SortOrder;
    searchQueryId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    opportunity?: Prisma.OpportunityOrderByWithRelationInput;
    searchQuery?: Prisma.SearchQueryOrderByWithRelationInput;
};
export type OpportunitySearchQueryWhereUniqueInput = Prisma.AtLeast<{
    opportunityId_searchQueryId?: Prisma.OpportunitySearchQueryOpportunityIdSearchQueryIdCompoundUniqueInput;
    AND?: Prisma.OpportunitySearchQueryWhereInput | Prisma.OpportunitySearchQueryWhereInput[];
    OR?: Prisma.OpportunitySearchQueryWhereInput[];
    NOT?: Prisma.OpportunitySearchQueryWhereInput | Prisma.OpportunitySearchQueryWhereInput[];
    opportunityId?: Prisma.UuidFilter<"OpportunitySearchQuery"> | string;
    searchQueryId?: Prisma.UuidFilter<"OpportunitySearchQuery"> | string;
    createdAt?: Prisma.DateTimeFilter<"OpportunitySearchQuery"> | Date | string;
    opportunity?: Prisma.XOR<Prisma.OpportunityScalarRelationFilter, Prisma.OpportunityWhereInput>;
    searchQuery?: Prisma.XOR<Prisma.SearchQueryScalarRelationFilter, Prisma.SearchQueryWhereInput>;
}, "opportunityId_searchQueryId">;
export type OpportunitySearchQueryOrderByWithAggregationInput = {
    opportunityId?: Prisma.SortOrder;
    searchQueryId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.OpportunitySearchQueryCountOrderByAggregateInput;
    _max?: Prisma.OpportunitySearchQueryMaxOrderByAggregateInput;
    _min?: Prisma.OpportunitySearchQueryMinOrderByAggregateInput;
};
export type OpportunitySearchQueryScalarWhereWithAggregatesInput = {
    AND?: Prisma.OpportunitySearchQueryScalarWhereWithAggregatesInput | Prisma.OpportunitySearchQueryScalarWhereWithAggregatesInput[];
    OR?: Prisma.OpportunitySearchQueryScalarWhereWithAggregatesInput[];
    NOT?: Prisma.OpportunitySearchQueryScalarWhereWithAggregatesInput | Prisma.OpportunitySearchQueryScalarWhereWithAggregatesInput[];
    opportunityId?: Prisma.UuidWithAggregatesFilter<"OpportunitySearchQuery"> | string;
    searchQueryId?: Prisma.UuidWithAggregatesFilter<"OpportunitySearchQuery"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"OpportunitySearchQuery"> | Date | string;
};
export type OpportunitySearchQueryCreateInput = {
    createdAt?: Date | string;
    opportunity: Prisma.OpportunityCreateNestedOneWithoutOpportunitySearchQueriesInput;
    searchQuery: Prisma.SearchQueryCreateNestedOneWithoutOpportunitySearchQueriesInput;
};
export type OpportunitySearchQueryUncheckedCreateInput = {
    opportunityId: string;
    searchQueryId: string;
    createdAt?: Date | string;
};
export type OpportunitySearchQueryUpdateInput = {
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunity?: Prisma.OpportunityUpdateOneRequiredWithoutOpportunitySearchQueriesNestedInput;
    searchQuery?: Prisma.SearchQueryUpdateOneRequiredWithoutOpportunitySearchQueriesNestedInput;
};
export type OpportunitySearchQueryUncheckedUpdateInput = {
    opportunityId?: Prisma.StringFieldUpdateOperationsInput | string;
    searchQueryId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunitySearchQueryCreateManyInput = {
    opportunityId: string;
    searchQueryId: string;
    createdAt?: Date | string;
};
export type OpportunitySearchQueryUpdateManyMutationInput = {
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunitySearchQueryUncheckedUpdateManyInput = {
    opportunityId?: Prisma.StringFieldUpdateOperationsInput | string;
    searchQueryId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunitySearchQueryOpportunityIdSearchQueryIdCompoundUniqueInput = {
    opportunityId: string;
    searchQueryId: string;
};
export type OpportunitySearchQueryCountOrderByAggregateInput = {
    opportunityId?: Prisma.SortOrder;
    searchQueryId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type OpportunitySearchQueryMaxOrderByAggregateInput = {
    opportunityId?: Prisma.SortOrder;
    searchQueryId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type OpportunitySearchQueryMinOrderByAggregateInput = {
    opportunityId?: Prisma.SortOrder;
    searchQueryId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type OpportunitySearchQueryListRelationFilter = {
    every?: Prisma.OpportunitySearchQueryWhereInput;
    some?: Prisma.OpportunitySearchQueryWhereInput;
    none?: Prisma.OpportunitySearchQueryWhereInput;
};
export type OpportunitySearchQueryOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type OpportunitySearchQueryCreateNestedManyWithoutOpportunityInput = {
    create?: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutOpportunityInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput> | Prisma.OpportunitySearchQueryCreateWithoutOpportunityInput[] | Prisma.OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput[];
    connectOrCreate?: Prisma.OpportunitySearchQueryCreateOrConnectWithoutOpportunityInput | Prisma.OpportunitySearchQueryCreateOrConnectWithoutOpportunityInput[];
    createMany?: Prisma.OpportunitySearchQueryCreateManyOpportunityInputEnvelope;
    connect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
};
export type OpportunitySearchQueryUncheckedCreateNestedManyWithoutOpportunityInput = {
    create?: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutOpportunityInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput> | Prisma.OpportunitySearchQueryCreateWithoutOpportunityInput[] | Prisma.OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput[];
    connectOrCreate?: Prisma.OpportunitySearchQueryCreateOrConnectWithoutOpportunityInput | Prisma.OpportunitySearchQueryCreateOrConnectWithoutOpportunityInput[];
    createMany?: Prisma.OpportunitySearchQueryCreateManyOpportunityInputEnvelope;
    connect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
};
export type OpportunitySearchQueryUpdateManyWithoutOpportunityNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutOpportunityInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput> | Prisma.OpportunitySearchQueryCreateWithoutOpportunityInput[] | Prisma.OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput[];
    connectOrCreate?: Prisma.OpportunitySearchQueryCreateOrConnectWithoutOpportunityInput | Prisma.OpportunitySearchQueryCreateOrConnectWithoutOpportunityInput[];
    upsert?: Prisma.OpportunitySearchQueryUpsertWithWhereUniqueWithoutOpportunityInput | Prisma.OpportunitySearchQueryUpsertWithWhereUniqueWithoutOpportunityInput[];
    createMany?: Prisma.OpportunitySearchQueryCreateManyOpportunityInputEnvelope;
    set?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    disconnect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    delete?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    connect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    update?: Prisma.OpportunitySearchQueryUpdateWithWhereUniqueWithoutOpportunityInput | Prisma.OpportunitySearchQueryUpdateWithWhereUniqueWithoutOpportunityInput[];
    updateMany?: Prisma.OpportunitySearchQueryUpdateManyWithWhereWithoutOpportunityInput | Prisma.OpportunitySearchQueryUpdateManyWithWhereWithoutOpportunityInput[];
    deleteMany?: Prisma.OpportunitySearchQueryScalarWhereInput | Prisma.OpportunitySearchQueryScalarWhereInput[];
};
export type OpportunitySearchQueryUncheckedUpdateManyWithoutOpportunityNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutOpportunityInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput> | Prisma.OpportunitySearchQueryCreateWithoutOpportunityInput[] | Prisma.OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput[];
    connectOrCreate?: Prisma.OpportunitySearchQueryCreateOrConnectWithoutOpportunityInput | Prisma.OpportunitySearchQueryCreateOrConnectWithoutOpportunityInput[];
    upsert?: Prisma.OpportunitySearchQueryUpsertWithWhereUniqueWithoutOpportunityInput | Prisma.OpportunitySearchQueryUpsertWithWhereUniqueWithoutOpportunityInput[];
    createMany?: Prisma.OpportunitySearchQueryCreateManyOpportunityInputEnvelope;
    set?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    disconnect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    delete?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    connect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    update?: Prisma.OpportunitySearchQueryUpdateWithWhereUniqueWithoutOpportunityInput | Prisma.OpportunitySearchQueryUpdateWithWhereUniqueWithoutOpportunityInput[];
    updateMany?: Prisma.OpportunitySearchQueryUpdateManyWithWhereWithoutOpportunityInput | Prisma.OpportunitySearchQueryUpdateManyWithWhereWithoutOpportunityInput[];
    deleteMany?: Prisma.OpportunitySearchQueryScalarWhereInput | Prisma.OpportunitySearchQueryScalarWhereInput[];
};
export type OpportunitySearchQueryCreateNestedManyWithoutSearchQueryInput = {
    create?: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutSearchQueryInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput> | Prisma.OpportunitySearchQueryCreateWithoutSearchQueryInput[] | Prisma.OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput[];
    connectOrCreate?: Prisma.OpportunitySearchQueryCreateOrConnectWithoutSearchQueryInput | Prisma.OpportunitySearchQueryCreateOrConnectWithoutSearchQueryInput[];
    createMany?: Prisma.OpportunitySearchQueryCreateManySearchQueryInputEnvelope;
    connect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
};
export type OpportunitySearchQueryUncheckedCreateNestedManyWithoutSearchQueryInput = {
    create?: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutSearchQueryInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput> | Prisma.OpportunitySearchQueryCreateWithoutSearchQueryInput[] | Prisma.OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput[];
    connectOrCreate?: Prisma.OpportunitySearchQueryCreateOrConnectWithoutSearchQueryInput | Prisma.OpportunitySearchQueryCreateOrConnectWithoutSearchQueryInput[];
    createMany?: Prisma.OpportunitySearchQueryCreateManySearchQueryInputEnvelope;
    connect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
};
export type OpportunitySearchQueryUpdateManyWithoutSearchQueryNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutSearchQueryInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput> | Prisma.OpportunitySearchQueryCreateWithoutSearchQueryInput[] | Prisma.OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput[];
    connectOrCreate?: Prisma.OpportunitySearchQueryCreateOrConnectWithoutSearchQueryInput | Prisma.OpportunitySearchQueryCreateOrConnectWithoutSearchQueryInput[];
    upsert?: Prisma.OpportunitySearchQueryUpsertWithWhereUniqueWithoutSearchQueryInput | Prisma.OpportunitySearchQueryUpsertWithWhereUniqueWithoutSearchQueryInput[];
    createMany?: Prisma.OpportunitySearchQueryCreateManySearchQueryInputEnvelope;
    set?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    disconnect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    delete?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    connect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    update?: Prisma.OpportunitySearchQueryUpdateWithWhereUniqueWithoutSearchQueryInput | Prisma.OpportunitySearchQueryUpdateWithWhereUniqueWithoutSearchQueryInput[];
    updateMany?: Prisma.OpportunitySearchQueryUpdateManyWithWhereWithoutSearchQueryInput | Prisma.OpportunitySearchQueryUpdateManyWithWhereWithoutSearchQueryInput[];
    deleteMany?: Prisma.OpportunitySearchQueryScalarWhereInput | Prisma.OpportunitySearchQueryScalarWhereInput[];
};
export type OpportunitySearchQueryUncheckedUpdateManyWithoutSearchQueryNestedInput = {
    create?: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutSearchQueryInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput> | Prisma.OpportunitySearchQueryCreateWithoutSearchQueryInput[] | Prisma.OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput[];
    connectOrCreate?: Prisma.OpportunitySearchQueryCreateOrConnectWithoutSearchQueryInput | Prisma.OpportunitySearchQueryCreateOrConnectWithoutSearchQueryInput[];
    upsert?: Prisma.OpportunitySearchQueryUpsertWithWhereUniqueWithoutSearchQueryInput | Prisma.OpportunitySearchQueryUpsertWithWhereUniqueWithoutSearchQueryInput[];
    createMany?: Prisma.OpportunitySearchQueryCreateManySearchQueryInputEnvelope;
    set?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    disconnect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    delete?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    connect?: Prisma.OpportunitySearchQueryWhereUniqueInput | Prisma.OpportunitySearchQueryWhereUniqueInput[];
    update?: Prisma.OpportunitySearchQueryUpdateWithWhereUniqueWithoutSearchQueryInput | Prisma.OpportunitySearchQueryUpdateWithWhereUniqueWithoutSearchQueryInput[];
    updateMany?: Prisma.OpportunitySearchQueryUpdateManyWithWhereWithoutSearchQueryInput | Prisma.OpportunitySearchQueryUpdateManyWithWhereWithoutSearchQueryInput[];
    deleteMany?: Prisma.OpportunitySearchQueryScalarWhereInput | Prisma.OpportunitySearchQueryScalarWhereInput[];
};
export type OpportunitySearchQueryCreateWithoutOpportunityInput = {
    createdAt?: Date | string;
    searchQuery: Prisma.SearchQueryCreateNestedOneWithoutOpportunitySearchQueriesInput;
};
export type OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput = {
    searchQueryId: string;
    createdAt?: Date | string;
};
export type OpportunitySearchQueryCreateOrConnectWithoutOpportunityInput = {
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
    create: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutOpportunityInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput>;
};
export type OpportunitySearchQueryCreateManyOpportunityInputEnvelope = {
    data: Prisma.OpportunitySearchQueryCreateManyOpportunityInput | Prisma.OpportunitySearchQueryCreateManyOpportunityInput[];
    skipDuplicates?: boolean;
};
export type OpportunitySearchQueryUpsertWithWhereUniqueWithoutOpportunityInput = {
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
    update: Prisma.XOR<Prisma.OpportunitySearchQueryUpdateWithoutOpportunityInput, Prisma.OpportunitySearchQueryUncheckedUpdateWithoutOpportunityInput>;
    create: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutOpportunityInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutOpportunityInput>;
};
export type OpportunitySearchQueryUpdateWithWhereUniqueWithoutOpportunityInput = {
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
    data: Prisma.XOR<Prisma.OpportunitySearchQueryUpdateWithoutOpportunityInput, Prisma.OpportunitySearchQueryUncheckedUpdateWithoutOpportunityInput>;
};
export type OpportunitySearchQueryUpdateManyWithWhereWithoutOpportunityInput = {
    where: Prisma.OpportunitySearchQueryScalarWhereInput;
    data: Prisma.XOR<Prisma.OpportunitySearchQueryUpdateManyMutationInput, Prisma.OpportunitySearchQueryUncheckedUpdateManyWithoutOpportunityInput>;
};
export type OpportunitySearchQueryScalarWhereInput = {
    AND?: Prisma.OpportunitySearchQueryScalarWhereInput | Prisma.OpportunitySearchQueryScalarWhereInput[];
    OR?: Prisma.OpportunitySearchQueryScalarWhereInput[];
    NOT?: Prisma.OpportunitySearchQueryScalarWhereInput | Prisma.OpportunitySearchQueryScalarWhereInput[];
    opportunityId?: Prisma.UuidFilter<"OpportunitySearchQuery"> | string;
    searchQueryId?: Prisma.UuidFilter<"OpportunitySearchQuery"> | string;
    createdAt?: Prisma.DateTimeFilter<"OpportunitySearchQuery"> | Date | string;
};
export type OpportunitySearchQueryCreateWithoutSearchQueryInput = {
    createdAt?: Date | string;
    opportunity: Prisma.OpportunityCreateNestedOneWithoutOpportunitySearchQueriesInput;
};
export type OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput = {
    opportunityId: string;
    createdAt?: Date | string;
};
export type OpportunitySearchQueryCreateOrConnectWithoutSearchQueryInput = {
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
    create: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutSearchQueryInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput>;
};
export type OpportunitySearchQueryCreateManySearchQueryInputEnvelope = {
    data: Prisma.OpportunitySearchQueryCreateManySearchQueryInput | Prisma.OpportunitySearchQueryCreateManySearchQueryInput[];
    skipDuplicates?: boolean;
};
export type OpportunitySearchQueryUpsertWithWhereUniqueWithoutSearchQueryInput = {
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
    update: Prisma.XOR<Prisma.OpportunitySearchQueryUpdateWithoutSearchQueryInput, Prisma.OpportunitySearchQueryUncheckedUpdateWithoutSearchQueryInput>;
    create: Prisma.XOR<Prisma.OpportunitySearchQueryCreateWithoutSearchQueryInput, Prisma.OpportunitySearchQueryUncheckedCreateWithoutSearchQueryInput>;
};
export type OpportunitySearchQueryUpdateWithWhereUniqueWithoutSearchQueryInput = {
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
    data: Prisma.XOR<Prisma.OpportunitySearchQueryUpdateWithoutSearchQueryInput, Prisma.OpportunitySearchQueryUncheckedUpdateWithoutSearchQueryInput>;
};
export type OpportunitySearchQueryUpdateManyWithWhereWithoutSearchQueryInput = {
    where: Prisma.OpportunitySearchQueryScalarWhereInput;
    data: Prisma.XOR<Prisma.OpportunitySearchQueryUpdateManyMutationInput, Prisma.OpportunitySearchQueryUncheckedUpdateManyWithoutSearchQueryInput>;
};
export type OpportunitySearchQueryCreateManyOpportunityInput = {
    searchQueryId: string;
    createdAt?: Date | string;
};
export type OpportunitySearchQueryUpdateWithoutOpportunityInput = {
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    searchQuery?: Prisma.SearchQueryUpdateOneRequiredWithoutOpportunitySearchQueriesNestedInput;
};
export type OpportunitySearchQueryUncheckedUpdateWithoutOpportunityInput = {
    searchQueryId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunitySearchQueryUncheckedUpdateManyWithoutOpportunityInput = {
    searchQueryId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunitySearchQueryCreateManySearchQueryInput = {
    opportunityId: string;
    createdAt?: Date | string;
};
export type OpportunitySearchQueryUpdateWithoutSearchQueryInput = {
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    opportunity?: Prisma.OpportunityUpdateOneRequiredWithoutOpportunitySearchQueriesNestedInput;
};
export type OpportunitySearchQueryUncheckedUpdateWithoutSearchQueryInput = {
    opportunityId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunitySearchQueryUncheckedUpdateManyWithoutSearchQueryInput = {
    opportunityId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OpportunitySearchQuerySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    opportunityId?: boolean;
    searchQueryId?: boolean;
    createdAt?: boolean;
    opportunity?: boolean | Prisma.OpportunityDefaultArgs<ExtArgs>;
    searchQuery?: boolean | Prisma.SearchQueryDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["opportunitySearchQuery"]>;
export type OpportunitySearchQuerySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    opportunityId?: boolean;
    searchQueryId?: boolean;
    createdAt?: boolean;
    opportunity?: boolean | Prisma.OpportunityDefaultArgs<ExtArgs>;
    searchQuery?: boolean | Prisma.SearchQueryDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["opportunitySearchQuery"]>;
export type OpportunitySearchQuerySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    opportunityId?: boolean;
    searchQueryId?: boolean;
    createdAt?: boolean;
    opportunity?: boolean | Prisma.OpportunityDefaultArgs<ExtArgs>;
    searchQuery?: boolean | Prisma.SearchQueryDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["opportunitySearchQuery"]>;
export type OpportunitySearchQuerySelectScalar = {
    opportunityId?: boolean;
    searchQueryId?: boolean;
    createdAt?: boolean;
};
export type OpportunitySearchQueryOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"opportunityId" | "searchQueryId" | "createdAt", ExtArgs["result"]["opportunitySearchQuery"]>;
export type OpportunitySearchQueryInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunity?: boolean | Prisma.OpportunityDefaultArgs<ExtArgs>;
    searchQuery?: boolean | Prisma.SearchQueryDefaultArgs<ExtArgs>;
};
export type OpportunitySearchQueryIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunity?: boolean | Prisma.OpportunityDefaultArgs<ExtArgs>;
    searchQuery?: boolean | Prisma.SearchQueryDefaultArgs<ExtArgs>;
};
export type OpportunitySearchQueryIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    opportunity?: boolean | Prisma.OpportunityDefaultArgs<ExtArgs>;
    searchQuery?: boolean | Prisma.SearchQueryDefaultArgs<ExtArgs>;
};
export type $OpportunitySearchQueryPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "OpportunitySearchQuery";
    objects: {
        opportunity: Prisma.$OpportunityPayload<ExtArgs>;
        searchQuery: Prisma.$SearchQueryPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        opportunityId: string;
        searchQueryId: string;
        createdAt: Date;
    }, ExtArgs["result"]["opportunitySearchQuery"]>;
    composites: {};
};
export type OpportunitySearchQueryGetPayload<S extends boolean | null | undefined | OpportunitySearchQueryDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload, S>;
export type OpportunitySearchQueryCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<OpportunitySearchQueryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: OpportunitySearchQueryCountAggregateInputType | true;
};
export interface OpportunitySearchQueryDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['OpportunitySearchQuery'];
        meta: {
            name: 'OpportunitySearchQuery';
        };
    };
    findUnique<T extends OpportunitySearchQueryFindUniqueArgs>(args: Prisma.SelectSubset<T, OpportunitySearchQueryFindUniqueArgs<ExtArgs>>): Prisma.Prisma__OpportunitySearchQueryClient<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends OpportunitySearchQueryFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, OpportunitySearchQueryFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__OpportunitySearchQueryClient<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends OpportunitySearchQueryFindFirstArgs>(args?: Prisma.SelectSubset<T, OpportunitySearchQueryFindFirstArgs<ExtArgs>>): Prisma.Prisma__OpportunitySearchQueryClient<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends OpportunitySearchQueryFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, OpportunitySearchQueryFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__OpportunitySearchQueryClient<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends OpportunitySearchQueryFindManyArgs>(args?: Prisma.SelectSubset<T, OpportunitySearchQueryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends OpportunitySearchQueryCreateArgs>(args: Prisma.SelectSubset<T, OpportunitySearchQueryCreateArgs<ExtArgs>>): Prisma.Prisma__OpportunitySearchQueryClient<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends OpportunitySearchQueryCreateManyArgs>(args?: Prisma.SelectSubset<T, OpportunitySearchQueryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends OpportunitySearchQueryCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, OpportunitySearchQueryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends OpportunitySearchQueryDeleteArgs>(args: Prisma.SelectSubset<T, OpportunitySearchQueryDeleteArgs<ExtArgs>>): Prisma.Prisma__OpportunitySearchQueryClient<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends OpportunitySearchQueryUpdateArgs>(args: Prisma.SelectSubset<T, OpportunitySearchQueryUpdateArgs<ExtArgs>>): Prisma.Prisma__OpportunitySearchQueryClient<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends OpportunitySearchQueryDeleteManyArgs>(args?: Prisma.SelectSubset<T, OpportunitySearchQueryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends OpportunitySearchQueryUpdateManyArgs>(args: Prisma.SelectSubset<T, OpportunitySearchQueryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends OpportunitySearchQueryUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, OpportunitySearchQueryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends OpportunitySearchQueryUpsertArgs>(args: Prisma.SelectSubset<T, OpportunitySearchQueryUpsertArgs<ExtArgs>>): Prisma.Prisma__OpportunitySearchQueryClient<runtime.Types.Result.GetResult<Prisma.$OpportunitySearchQueryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends OpportunitySearchQueryCountArgs>(args?: Prisma.Subset<T, OpportunitySearchQueryCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], OpportunitySearchQueryCountAggregateOutputType> : number>;
    aggregate<T extends OpportunitySearchQueryAggregateArgs>(args: Prisma.Subset<T, OpportunitySearchQueryAggregateArgs>): Prisma.PrismaPromise<GetOpportunitySearchQueryAggregateType<T>>;
    groupBy<T extends OpportunitySearchQueryGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: OpportunitySearchQueryGroupByArgs['orderBy'];
    } : {
        orderBy?: OpportunitySearchQueryGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, OpportunitySearchQueryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOpportunitySearchQueryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: OpportunitySearchQueryFieldRefs;
}
export interface Prisma__OpportunitySearchQueryClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    opportunity<T extends Prisma.OpportunityDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OpportunityDefaultArgs<ExtArgs>>): Prisma.Prisma__OpportunityClient<runtime.Types.Result.GetResult<Prisma.$OpportunityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    searchQuery<T extends Prisma.SearchQueryDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SearchQueryDefaultArgs<ExtArgs>>): Prisma.Prisma__SearchQueryClient<runtime.Types.Result.GetResult<Prisma.$SearchQueryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface OpportunitySearchQueryFieldRefs {
    readonly opportunityId: Prisma.FieldRef<"OpportunitySearchQuery", 'String'>;
    readonly searchQueryId: Prisma.FieldRef<"OpportunitySearchQuery", 'String'>;
    readonly createdAt: Prisma.FieldRef<"OpportunitySearchQuery", 'DateTime'>;
}
export type OpportunitySearchQueryFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.OpportunitySearchQueryOmit<ExtArgs> | null;
    include?: Prisma.OpportunitySearchQueryInclude<ExtArgs> | null;
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
};
export type OpportunitySearchQueryFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.OpportunitySearchQueryOmit<ExtArgs> | null;
    include?: Prisma.OpportunitySearchQueryInclude<ExtArgs> | null;
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
};
export type OpportunitySearchQueryFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type OpportunitySearchQueryFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type OpportunitySearchQueryFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type OpportunitySearchQueryCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.OpportunitySearchQueryOmit<ExtArgs> | null;
    include?: Prisma.OpportunitySearchQueryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OpportunitySearchQueryCreateInput, Prisma.OpportunitySearchQueryUncheckedCreateInput>;
};
export type OpportunitySearchQueryCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.OpportunitySearchQueryCreateManyInput | Prisma.OpportunitySearchQueryCreateManyInput[];
    skipDuplicates?: boolean;
};
export type OpportunitySearchQueryCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySearchQuerySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OpportunitySearchQueryOmit<ExtArgs> | null;
    data: Prisma.OpportunitySearchQueryCreateManyInput | Prisma.OpportunitySearchQueryCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.OpportunitySearchQueryIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type OpportunitySearchQueryUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.OpportunitySearchQueryOmit<ExtArgs> | null;
    include?: Prisma.OpportunitySearchQueryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OpportunitySearchQueryUpdateInput, Prisma.OpportunitySearchQueryUncheckedUpdateInput>;
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
};
export type OpportunitySearchQueryUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.OpportunitySearchQueryUpdateManyMutationInput, Prisma.OpportunitySearchQueryUncheckedUpdateManyInput>;
    where?: Prisma.OpportunitySearchQueryWhereInput;
    limit?: number;
};
export type OpportunitySearchQueryUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySearchQuerySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OpportunitySearchQueryOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OpportunitySearchQueryUpdateManyMutationInput, Prisma.OpportunitySearchQueryUncheckedUpdateManyInput>;
    where?: Prisma.OpportunitySearchQueryWhereInput;
    limit?: number;
    include?: Prisma.OpportunitySearchQueryIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type OpportunitySearchQueryUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.OpportunitySearchQueryOmit<ExtArgs> | null;
    include?: Prisma.OpportunitySearchQueryInclude<ExtArgs> | null;
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
    create: Prisma.XOR<Prisma.OpportunitySearchQueryCreateInput, Prisma.OpportunitySearchQueryUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.OpportunitySearchQueryUpdateInput, Prisma.OpportunitySearchQueryUncheckedUpdateInput>;
};
export type OpportunitySearchQueryDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.OpportunitySearchQueryOmit<ExtArgs> | null;
    include?: Prisma.OpportunitySearchQueryInclude<ExtArgs> | null;
    where: Prisma.OpportunitySearchQueryWhereUniqueInput;
};
export type OpportunitySearchQueryDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OpportunitySearchQueryWhereInput;
    limit?: number;
};
export type OpportunitySearchQueryDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OpportunitySearchQuerySelect<ExtArgs> | null;
    omit?: Prisma.OpportunitySearchQueryOmit<ExtArgs> | null;
    include?: Prisma.OpportunitySearchQueryInclude<ExtArgs> | null;
};
