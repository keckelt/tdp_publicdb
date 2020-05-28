import { ACommonList } from 'tdp_gene/src/views/ACommonList';
import { gene } from '../config';
export class GeneList extends ACommonList {
    constructor(context, selection, parent, options) {
        super(context, selection, parent, gene, Object.assign({
            enableAddingColumnGrouping: true
        }, options));
    }
    getColumnDescs(columns) {
        return gene.columns((c) => columns.find((d) => d.column === c));
    }
}
//# sourceMappingURL=GeneList.js.map