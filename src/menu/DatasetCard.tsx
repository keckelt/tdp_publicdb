import React from 'react';
import {INamedSet, ENamedSetType, RestBaseUtils, RestStorageUtils} from 'tdp_core';
import {NamedSetList, useAsync, OrdinoContext} from 'ordino';
import {UserSession, UniqueIdManager} from 'phovea_core';
import {DatasetSearchBox} from './DatasetSearchBox';
import {Species, SpeciesUtils, IACommonListOptions} from 'tdp_gene';
import {IPublicDbStartMenuDatasetSectionDesc} from '../base/extensions';

export default function DatasetCard({name, icon, tabs, startViewId, dataSource, cssClass}: IPublicDbStartMenuDatasetSectionDesc) {
  const {app} = React.useContext(OrdinoContext);
  const [dirtyNamedSets, setDirtyNamedSets] = React.useState(false);

  const loadPredefinedSet = React.useMemo<() => Promise<INamedSet[]>>(() => {
    return () => RestBaseUtils.getTDPData(dataSource.db, `${dataSource.base}_panel`)
      .then((panels: {id: string, description: string, species: string}[]) => {
        return [{
          name: 'All',
          type: ENamedSetType.CUSTOM,
          subTypeKey: Species.SPECIES_SESSION_KEY,
          subTypeFromSession: true,
          subTypeValue: SpeciesUtils.getSelectedSpecies(),
          description: '',
          idType: '',
          ids: '',
          creator: ''
        }, ...panels
          .map(function panel2NamedSet({id, description, species}): INamedSet {
            return {
              type: ENamedSetType.PANEL,
              id,
              name: id,
              description,
              subTypeKey: Species.SPECIES_SESSION_KEY,
              subTypeFromSession: false,
              subTypeValue: species,
              idType: ''
            };
          })];
      });
  }, [dataSource.idType]);

  const loadNamedSets = React.useMemo<() => Promise<INamedSet[]>>(() => {
    return () => RestStorageUtils.listNamedSets(dataSource.idType);
  }, [dataSource.idType, dirtyNamedSets]);

  const predefinedNamedSets = useAsync(loadPredefinedSet);
  const me = UserSession.getInstance().currentUserNameOrAnonymous();
  const namedSets = useAsync(loadNamedSets);
  const myNamedSets = {...namedSets, ...{value: namedSets.value?.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator === me)}};
  const publicNamedSets = {...namedSets, ...{value: namedSets.value?.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator !== me)}};
  const filterValue = (value: INamedSet[], tab: string) => value?.filter((entry) => entry.subTypeValue === tab);
  const onNamedSetsChanged = () => setDirtyNamedSets((d) => !d);

  const onOpenNamedSet = (event: React.MouseEvent<HTMLElement>, {namedSet, species}: {namedSet: INamedSet, species: string}) => {
    event.preventDefault();

    const defaultSessionValues = {
      [Species.SPECIES_SESSION_KEY]: species
    };

    app.startNewSession(startViewId, {namedSet}, defaultSessionValues);
  };

  const onOpenSearchResult = (event: React.MouseEvent<HTMLElement>, {searchResult, species}: {searchResult: Partial<IACommonListOptions>, species: string}) => {
    event.preventDefault();

    const defaultSessionValues = {
      [Species.SPECIES_SESSION_KEY]: species
    };

    app.startNewSession(startViewId, searchResult, defaultSessionValues);
  };

  const id = React.useMemo(() => UniqueIdManager.getInstance().uniqueId(), []);
  const activeTabIndex = 0;

  return (
    <div className={`ordino-dataset ${cssClass || ''}`}>
      <h4 className="text-left mb-3"><i className={'mr-2 ordino-icon-2 ' + icon}></i>{name}</h4>
      <div className="card shadow-sm">
        <div className="card-body p-3">
          <ul className="nav nav-pills session-tab">
            {tabs.map((tab, index) => {
              return (
                <li key={tab.id} className="nav-item" role="presentation">
                  <a className={`nav-link ${(index === activeTabIndex) ? 'active' : ''}`} id={`dataset-tab-${tab.id}-${id}`} data-toggle="tab" href={`#dataset-panel-${tab.id}-${id}`} role="tab" aria-controls={`dataset-panel-${tab.id}-${id}`} aria-selected={(index === activeTabIndex)}>
                    <i className={'mr-2 ' + tab.icon}></i>{tab.name}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="tab-content">
            {tabs.map((tab, index) => {
              return (
                <div key={tab.id} className={`tab-pane fade mt-4 ${(index === activeTabIndex) ? 'show active' : ''}`} role="tabpanel" id={`dataset-panel-${tab.id}-${id}`} aria-labelledby={`dataset-tab-${tab.id}-${id}`}>
                  <DatasetSearchBox
                    placeholder={`Add ${name}`}
                    dataSource={dataSource}
                    onNamedSetsChanged={onNamedSetsChanged}
                    onOpen={(event, searchResult: Partial<IACommonListOptions>) => {onOpenSearchResult(event, {searchResult, species: tab.id});}} />
                  <div className="row mt-4">
                    <NamedSetList
                      headerIcon="fas fa-database"
                      headerText="Predefined Sets"
                      onOpen={(event, namedSet: INamedSet) => {onOpenNamedSet(event, {namedSet, species: tab.id});}}
                      status={predefinedNamedSets.status}
                      value={filterValue(predefinedNamedSets.value, tab.id)} />
                    <NamedSetList
                      headerIcon="fas fa-user"
                      headerText="My Sets" onOpen={(event, namedSet: INamedSet) => {onOpenNamedSet(event, {namedSet, species: tab.id});}}
                      status={myNamedSets.status}
                      value={filterValue(myNamedSets.value, tab.id)} />
                    <NamedSetList
                      headerIcon="fas fa-users"
                      headerText="Public Sets"
                      onOpen={(event, namedSet: INamedSet) => {onOpenNamedSet(event, {namedSet, species: tab.id});}}
                      status={publicNamedSets.status}
                      value={filterValue(publicNamedSets.value, tab.id)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
