import { ColumnDescUtils, RestBaseUtils } from 'tdp_core';
import { FormDialog } from 'tdp_core';
import { MAX_FILTER_SCORE_ROWS_BEFORE_ALL } from '../common/config';
import { FormElementType } from 'tdp_core';
import { AppContext, IDTypeManager } from 'phovea_core';
import { ScoreUtils } from './ScoreUtils';
import { SpeciesUtils, FieldUtils } from 'tdp_gene';
/**
 * Score implementation
 */
export class GeneSignatureScore {
    constructor(params, dataSource, options) {
        this.params = params;
        this.dataSource = dataSource;
        this.options = options;
    }
    /**
     * Defines the IDType of which score values are returned. A score row is a pair of id and its score, e.g. {id: 'EGFR', score: 100}
     * @type {IDType}
     */
    get idType() {
        return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
    }
    /**
     * Creates the column description used within LineUp to create the oclumn
     * @returns {IAdditionalColumnDesc}
     */
    createDesc() {
        const label = this.options.description;
        return ColumnDescUtils.numberCol('_gene_signature', -5, 5, { label, width: 100 });
    }
    /**
     * Computes the actual scores and returns a Promise of IScoreRow rows.
     * @returns {Promise<IScoreRow<number>[]>}
     */
    async compute(ids, idtype, namedSet) {
        const params = {
            signature: this.params.signature,
            species: SpeciesUtils.getSelectedSpecies()
        };
        FieldUtils.limitScoreRows(params, ids, idtype, this.dataSource.entityName, MAX_FILTER_SCORE_ROWS_BEFORE_ALL, namedSet);
        return RestBaseUtils.getTDPScore(this.dataSource.db, `${this.dataSource.base}_gene_signature_score`, params);
    }
    static createGeneSignatureScore(data, pluginDesc) {
        const { primary } = ScoreUtils.selectDataSources(pluginDesc);
        return new GeneSignatureScore(data.params, primary, data.options);
    }
    /**
     * Builder function for building the parameters of the score.
     * @returns {Promise<ISignatureColumnParam>} a promise for the parameter.
     */
    static async createGeneSignatureDialog(pluginDesc) {
        const dialog = new FormDialog('Add Gene Signature Column', 'Add');
        const data = await AppContext.getInstance().getAPIJSON(`/tdp/db/publicdb/gene_signature`);
        const optionsData = data.map((item) => ({ name: `${item.id} (${item.description})`, value: item.id }));
        dialog.append({
            type: FormElementType.SELECT,
            label: 'Signature',
            id: 'signature',
            attributes: {
                style: 'width:100%'
            },
            required: true,
            options: {
                optionsData
            }
        });
        return dialog.showAsPromise((r) => {
            const chosen = (r.getElementValues());
            const result = { params: chosen, options: { description: (data.find((item) => item.id === chosen.signature).description) } };
            return result;
        });
    }
}
//# sourceMappingURL=GeneSignatureScore.js.map