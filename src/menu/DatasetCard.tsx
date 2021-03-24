import React from 'react';
import {Card, Nav, Tab, Row} from 'react-bootstrap';
import {INamedSet, ENamedSetType, RestBaseUtils, RestStorageUtils} from 'tdp_core';
import {NamedSetList, useAsync, IStartMenuDatasetSectionDesc, GraphContext, OrdinoContext} from 'ordino';
import {UserSession} from 'phovea_core';
import {DatasetSearchBox} from './DatasetSearchBox';
import {Species, SpeciesUtils, IACommonListOptions} from 'tdp_gene';
import {IDataSourceConfig} from '..';

interface IDatasetCardProps extends IStartMenuDatasetSectionDesc {
  dataSource: IDataSourceConfig;
}


export default function DatasetCard({name, headerIcon, tabs, viewId, dataSource}: IDatasetCardProps) {
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

    app.startNewSession(viewId, {namedSet}, defaultSessionValues);
  };

  const onOpenSearchResult = (event: React.MouseEvent<HTMLElement>, {searchResult, species}: {searchResult: Partial<IACommonListOptions>, species: string}) => {
    event.preventDefault();

    const defaultSessionValues = {
      [Species.SPECIES_SESSION_KEY]: species
    };

    app.startNewSession(viewId, searchResult, defaultSessionValues);
  };

  return (
    <>
      <h4 className="text-left mt-4 mb-3"><i className={'mr-2 ordino-icon-2 ' + headerIcon}></i>{name}</h4>
      <Card className="shadow-sm">
        <Card.Body className="p-3">
          <Tab.Container defaultActiveKey={tabs[0].id}>
            <Nav className="session-tab" variant="pills">
              {tabs.map((tab) => {
                return (
                  <Nav.Item key={tab.id}>
                    <Nav.Link eventKey={tab.id}><i className={'mr-2 ' + tab.tabIcon}></i>{tab.tabText}</Nav.Link>
                  </Nav.Item>
                );
              })}
            </Nav>
            <Tab.Content>
              {tabs.map((tab) => {
                return (
                  <Tab.Pane key={tab.id} eventKey={tab.id} className="mt-4">
                    <DatasetSearchBox
                      placeholder={`Add ${name}`}
                      dataSource={dataSource}
                      onNamedSetsChanged={onNamedSetsChanged}
                      onOpen={(event, searchResult: Partial<IACommonListOptions>) => {onOpenSearchResult(event, {searchResult, species: tab.id});}} />
                    <Row className="mt-4">
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
                    </Row>
                  </Tab.Pane>
                );
              })}
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </>
  );
}
