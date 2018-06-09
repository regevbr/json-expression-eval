import { Func, FunctionsTable } from "../../dist";
import { ExpressionContext } from "./evaluator";
export interface FunctionDescription {
    name: string;
    evaluate: Func<ExpressionContext>;
}
export declare type FuncFactory = () => FunctionDescription;
declare const functionsTable: FunctionsTable<ExpressionContext>;
export { functionsTable };
