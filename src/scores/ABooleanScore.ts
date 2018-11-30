import {IScore, IScoreRow} from 'tdp_core/src/extensions';
import {resolve} from 'phovea_core/src/idtype';
import {booleanCol} from 'tdp_core/src/lineup';
import {getTDPScore} from 'tdp_core/src/rest';
import {ICommonScoreParam} from './AScore';
import {IDataSourceConfig} from '../config';


export interface IBooleanScoreParams {
  [key: string]: any;
}

/**
 * score implementation in this case a numeric score is computed
 */
abstract class ABooleanScore implements IScore<number> {

  /**
   * defines the IDType of which score values are returned. A score row is a pair of id and its score, e.g. {id: 'EGFR', score: 100}
   * @type {IDType}
   */
  get idType() {
    return resolve(this.dataSource.idType);
  }

  constructor(protected readonly params: IBooleanScoreParams, protected readonly dataSource: IDataSourceConfig) {}

  /**
   * creates the column description used within LineUp to create the oclumn
   * @returns {IAdditionalColumnDesc}
   */
  createDesc() {
    const label = this.label;
    return booleanCol(this.columnName, {label, width: 50});
  }

  /**
   * computes the actual scores and returns a Promise of IScoreRow rows
   * @returns {Promise<IScoreRow<number>[]>}
   */
  compute(): Promise<IScoreRow<number>[]> {
    return getTDPScore(this.dataSource.db, `${this.dataSource.base}_${this.columnName}_score`, this.params);
  }

  protected abstract get label(): string;
  protected abstract get columnName(): string;
}

export default ABooleanScore;