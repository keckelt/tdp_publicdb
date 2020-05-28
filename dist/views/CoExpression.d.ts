/**
 * Created by sam on 16.02.2017.
 */
import { IFormSelectDesc } from 'tdp_core/src/form';
import { ACoExpression, ICoExprDataFormatRow, IGeneOption } from 'tdp_gene/src/views/ACoExpression';
import Range from 'phovea_core/src/range/Range';
export declare class CoExpression extends ACoExpression {
    protected getParameterFormDescs(): IFormSelectDesc[];
    private get dataSource();
    private get dataSubType();
    loadGeneList(ensgs: string[]): Promise<{
        id: string;
        symbol: string;
        _id: number;
    }[]>;
    loadData(ensg: string): Promise<ICoExprDataFormatRow[]>;
    loadFirstName(ensg: string): Promise<string>;
    protected getAttributeName(): string;
    get itemIDType(): import("phovea_core/src/idtype").IDType;
    protected select(range: Range): void;
    protected getNoDataErrorMessage(refGene: IGeneOption): string;
}
