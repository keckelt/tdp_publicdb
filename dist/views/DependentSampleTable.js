/**
 * Created by Marc Streit on 26.07.2016.
 */
import { ARankingView, AdapterUtils } from 'tdp_core';
import { SpeciesUtils } from 'tdp_gene';
import { expression, copyNumber, mutation } from '../common/config';
import { ParameterFormIds, FORM_DATA_SOURCE, FORM_TISSUE_OR_CELLLINE_FILTER } from '../common/forms';
import { FormElementType } from 'tdp_core';
import { RestBaseUtils } from 'tdp_core';
import { IDTypeManager } from 'phovea_core';
import { loadFirstName, postProcessScore, subTypeDesc } from './utils';
import { LineUpUtils } from 'tdp_core';
export class DependentSampleTable extends ARankingView {
    constructor(context, selection, parent, dataType, options = {}) {
        super(context, selection, parent, Object.assign({
            additionalScoreParameter: () => this.dataSource,
            itemName: () => this.dataSource.name,
            enableAddingColumnGrouping: true
        }, Object.assign(options, { enableSidePanel: 'collapsed' })));
        this.dataType = dataType;
    }
    getParameterFormDescs() {
        return super.getParameterFormDescs().concat([
            FORM_DATA_SOURCE,
            {
                type: FormElementType.SELECT,
                label: 'Data Subtype',
                id: ParameterFormIds.DATA_SUBTYPE,
                options: {
                    optionsData: this.dataType.dataSubtypes.map((ds) => {
                        return { name: ds.name, value: ds.id, data: ds };
                    })
                },
                useSession: true
            },
            FORM_TISSUE_OR_CELLLINE_FILTER
        ]);
    }
    get itemIDType() {
        return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
    }
    get dataSource() {
        return this.getParameterData(ParameterFormIds.DATA_SOURCE);
    }
    get dataSubType() {
        return this.getParameterData(ParameterFormIds.DATA_SUBTYPE);
    }
    parameterChanged(name) {
        return this.rebuild();
    }
    loadColumnDesc() {
        const dataSource = this.dataSource;
        return RestBaseUtils.getTDPDesc(dataSource.db, dataSource.base);
    }
    createSelectionAdapter() {
        return AdapterUtils.single({
            createDesc: (_id, id) => loadFirstName(id).then((label) => subTypeDesc(this.dataSubType, _id, label)),
            loadData: (_id, id) => this.loadSelectionColumnData(id)
        });
    }
    getColumnDescs(columns) {
        return this.dataSource.columns((c) => columns.find((d) => d.column === c));
    }
    loadRows() {
        const dataSource = this.dataSource;
        const filter = LineUpUtils.toFilter(this.getParameter('filter'));
        filter.species = SpeciesUtils.getSelectedSpecies();
        return RestBaseUtils.getTDPFilteredRows(dataSource.db, dataSource.base, {}, filter);
    }
    loadSelectionColumnData(name) {
        const dataSource = this.dataSource;
        const subType = this.dataSubType;
        const param = {
            table: this.dataType.tableName,
            attribute: subType.id,
            name,
            species: SpeciesUtils.getSelectedSpecies()
        };
        const filter = LineUpUtils.toFilter(this.getParameter('filter'));
        return RestBaseUtils.getTDPScore(dataSource.db, `${dataSource.base}_gene_single_score`, param, filter).then(postProcessScore(subType));
    }
}
export function createExpressionDependentSampleTable(context, selection, parent, options) {
    return new DependentSampleTable(context, selection, parent, expression, options);
}
export function createCopyNumberDependentSampleTable(context, selection, parent, options) {
    return new DependentSampleTable(context, selection, parent, copyNumber, options);
}
export function createMutationDependentSampleTable(context, selection, parent, options) {
    return new DependentSampleTable(context, selection, parent, mutation, options);
}
//# sourceMappingURL=DependentSampleTable.js.map