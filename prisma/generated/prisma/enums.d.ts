export declare const SearchQueryType: {
    readonly KEYWORD: "KEYWORD";
    readonly PHRASE: "PHRASE";
};
export type SearchQueryType = (typeof SearchQueryType)[keyof typeof SearchQueryType];
