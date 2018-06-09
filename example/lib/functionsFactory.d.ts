import { Func, FunctionsTable } from "../../dist";
export interface FunctionDescription {
    name: string;
    evaluate: Func;
}
export declare type FuncFactory = () => FunctionDescription;
declare const functionsTable: FunctionsTable;
export { functionsTable };
