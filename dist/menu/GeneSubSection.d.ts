/**
 * Created by Holger Stitz on 10.08.2016.
 */
import { ACommonSubSection } from 'tdp_gene/src/menu/ACommonSubSection';
import { IStartMenuSubSectionDesc } from 'tdp_gene/src/extensions';
import { IStartMenuSectionOptions } from 'ordino/src/extensions';
/**
 * Entry point list from all species and LineUp named sets (aka stored LineUp sessions)
 */
export declare class GeneSubSection extends ACommonSubSection {
    constructor(parent: HTMLElement, desc: IStartMenuSubSectionDesc, options: IStartMenuSectionOptions);
    protected searchOptions(): any;
}
