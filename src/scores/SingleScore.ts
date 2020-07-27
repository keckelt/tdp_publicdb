/**
 * Created by sam on 06.03.2017.
 */

import {IDataSourceConfig} from '../common/config';
import {IScore} from 'tdp_core';
import {IPluginDesc} from 'phovea_core';
import {ScoreUtils} from './ScoreUtils';
import {ASingleScore} from './ASingleScore';
import {IParams} from 'tdp_core';

interface ISingleScoreParam {
  name: {id: string, text: string};
  data_type: string;
  data_subtype: string;
  screen_type?: string;
  /**
   * see config.MAX_FILTER_SCORE_ROWS_BEFORE_ALL maximal number of rows for computing limiting the score to this subset
   */
  maxDirectFilterRows?: number;
}

function initializeScore(data: ISingleScoreParam, pluginDesc: IPluginDesc, singleScoreFactory: (parameter: ISingleScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig) => ASingleScore): IScore<number>|IScore<any>[] {
  const {primary, opposite} = ScoreUtils.selectDataSources(pluginDesc);
  const configs = (<any>data).data_types;
  function defineScore(name: {id: string, text: string}) {
    if (configs) {
      return configs.map((ds) => singleScoreFactory({name, data_type: ds[0], data_subtype: ds[1], maxDirectFilterRows: data.maxDirectFilterRows}, primary, opposite));
    } else {
      return singleScoreFactory(Object.assign({}, data, { name }), primary, opposite);
    }
  }
  if (Array.isArray(data.name)) {
    return [].concat(...data.name.map((name) => defineScore(name)));
  } else {
    return defineScore(data.name);
  }
}

export class SingleScore extends ASingleScore implements IScore<any> {
  constructor(parameter: ISingleScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig) {
    super(parameter, dataSource, oppositeDataSource);
  }

  protected getViewPrefix(): string {
    return '';
  }

  static createScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number>|IScore<any>[] {
    return initializeScore(data, pluginDesc, (parameter, dataSource, oppositeDataSource) => new SingleScore(parameter, dataSource, oppositeDataSource));
  }
}

export class SingleDepletionScore extends ASingleScore implements IScore<any> {
  constructor(parameter: ISingleScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig) {
    super(parameter, dataSource, oppositeDataSource);
  }

  protected getViewPrefix(): string {
    return 'depletion_';
  }

  protected createFilter(): IParams {
    return {
      depletionscreen: this.dataSubType.id === 'ceres' ? 'Avana' : 'Drive'
    };
  }
  static createSingleDepletionScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number>|IScore<any>[] {
    return initializeScore(data, pluginDesc, (parameter, dataSource, oppositeDataSource) => new SingleDepletionScore(parameter, dataSource, oppositeDataSource));
  }
}

export class SingleDrugScore extends ASingleScore implements IScore<any> {
  private readonly drugscreen: string;

  constructor(parameter: ISingleScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig) {
    super(parameter, dataSource, oppositeDataSource);
    this.drugscreen = parameter.screen_type;
  }

  protected getViewPrefix(): string {
    return 'drug_';
  }

  protected createFilter(): IParams {
    return {
      campaign: this.drugscreen
    };
  }
  static createSingleDrugScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number> | IScore<any>[] {
    return initializeScore(data, pluginDesc, (parameter, dataSource, oppositeDataSource) => new SingleDrugScore(parameter, dataSource, oppositeDataSource));
  }
}
