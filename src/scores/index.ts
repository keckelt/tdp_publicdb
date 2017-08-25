/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import {IPluginDesc} from 'phovea_core/src/plugin';
import {ParameterFormIds, FORM_GENE_FILTER, FORM_TISSUE_FILTER, FORM_CELLLINE_FILTER} from '../forms';
import {IScore} from 'tdp_core/src/extensions';
import AggregatedScore from './AggregatedScore';
import FrequencyScore from './FrequencyScore';
import {
  FORCE_COMPUTE_ALL_CELLLINE, FORCE_COMPUTE_ALL_GENES, FORCE_COMPUTE_ALL_TISSUE,
  FORM_AGGREGATED_SCORE
} from './forms';
import {gene, tissue, cellline, splitTypes, MAX_FILTER_SCORE_ROWS_BEFORE_ALL} from '../config';
import {selectDataSources} from './utils';
import {FormDialog, convertRow2MultiMap, IFormElementDesc}  from 'tdp_core/src/form';


export function create(pluginDesc: IPluginDesc, extras: any, countHint?: number) {
  const {primary, opposite} = selectDataSources(pluginDesc);

  const dialog = new FormDialog('Add Aggregated Score Column', 'Add Aggregated Score Column');
  const formDesc: IFormElementDesc[] = FORM_AGGREGATED_SCORE.slice();
  switch(opposite) {
    case gene:
      formDesc.unshift(FORM_GENE_FILTER);
      formDesc.push(primary === tissue ? FORCE_COMPUTE_ALL_TISSUE : FORCE_COMPUTE_ALL_CELLLINE);
      break;
    case tissue:
      formDesc.unshift(FORM_TISSUE_FILTER);
      formDesc.push(FORCE_COMPUTE_ALL_GENES);
      break;
    case cellline:
      formDesc.unshift(FORM_CELLLINE_FILTER);
      formDesc.push(FORCE_COMPUTE_ALL_GENES);
      break;
  }

  if (typeof countHint === 'number' && countHint > MAX_FILTER_SCORE_ROWS_BEFORE_ALL) {
    formDesc.pop();
  }

  dialog.append(...formDesc);

  return dialog.showAsPromise((builder) => {
    const data = builder.getElementData();
    const {dataType, dataSubType} = splitTypes(data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE].id);
    delete data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE];
    data.data_type = dataType.id;
    data.data_subtype = dataSubType.id;
    data.filter = convertRow2MultiMap(data.filter);
    return data;
  });
}

export function createScore(data, pluginDesc: IPluginDesc): IScore<number> {
  const {primary, opposite} = selectDataSources(pluginDesc);
  const aggregation = data[ParameterFormIds.AGGREGATION];
  if (aggregation === 'frequency' || aggregation === 'count') {
    // boolean to indicate that the resulting score does not need to be divided by the total count
    const countOnly = aggregation === 'count';
    return new FrequencyScore(data, primary, opposite, countOnly);
  }
  return new AggregatedScore(data, primary, opposite);
}
