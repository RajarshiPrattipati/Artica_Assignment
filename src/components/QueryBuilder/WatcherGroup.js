import React, {useState} from 'react';
import * as PropTypes from 'prop-types';
import { Select, Input, Divider, Checkbox } from 'antd';
import MemberDropdown from './MemberDropdown';
import RemoveButtonGroup from './RemoveButtonGroup';
import FilterInput from './FilterInput';
import PlusIcon from './PlusIcon';
import _ from 'lodash';
import styled from 'styled-components';
import CheckboxGroup from 'antd/lib/checkbox/Group';

const HorizontalDivider = styled(Divider)`
  padding: 0;
  margin: 0;
  background: #F4F5F6;
`

const SeasonToName = [{name: 'Week', members: ["Today, Yesterday, This week", "This month", "Last 7 days", "Last week"]}, 
                      {name: 'Month', members: ["This quarter", "Last 30 days", "This month", "Last month", "Last quarter"]},
                      {name: 'Year', members: ["This year, Last year", "All time"]} ]


const operators = [ {name:'Auto', title:'Auto'}, {name:'Seasonal',title:'Seasonal'}, {name:'Static',title:'Static'}]
const initialWatchers = [
  {
    key: 'Target',
    title: 'Target Title',
    name: 'Target Name',
    operator: operators[0],
    index : 'Target',
  }
]
const WatcherGroup = ({
  members, addMemberName, timeDimensions
}) => {
  const [Watchers, setWatchers] = useState(initialWatchers);
  const dateRange = timeDimensions.length? timeDimensions[0].dateRange : 0;  
  console.log("WATCHERS",Watchers,dateRange );
  let seasonName = 'Year';
  if(dateRange && SeasonToName[0].members.includes(dateRange))
    seasonName = 'Week'
  else if(dateRange && SeasonToName[1].members.includes(dateRange))
    seasonName = 'Month'
  
  let remove = (m) => {
    setWatchers(_.remove(Watchers,function(x){
      return x===m
    }))
  }
  let add = (m) => {
    console.log("ADD",m);
    setWatchers([...Watchers,{operator: m, title: 'New Watcher', name: 'New Watcher'}]);
  }
  let update = (m, i) => {
    // let x = Watchers;
    // let y = x.splice(i,1,m)
    // console.log("I",i,x);
    // setWatchers(x)
  }
  if(!members)
    return;
  console.log("WATCHERS",Watchers)
  return (
  <span>
    <HorizontalDivider />,

    {Watchers.map((m,i) => (
      <div style={{ marginBottom: 12 }} key={m.index}>
         <Input
          key="input"
          placeholder="Name"
          style={{
            width: 200,
            marginRight: 8
          }}
          onChange={e => update(Watchers,'Watchers[i].key',e.target.value)}
          value={m.key || ""}
        />
        <RemoveButtonGroup onRemoveClick={() => remove(m)}>
          <MemberDropdown
            type="selected-filter"
            onClick={updateWith => update({ ...m, operator: {title: updateWith, name: updateWith }}, i)}
            availableMembers={operators}
            style={{
              width: 150,
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}
          >
            {m.operator.title}
          </MemberDropdown>
        </RemoveButtonGroup>
        {m.operator.title === 'Auto'? 
         <span>
          Scaling Factor<Input
          key="input"
          placeholder="0<x<1"
          style={{
            width: 200,
            marginRight: 8,
            marginLeft: 8,

          }}
          value={1.2 || ""}
          /></span>
       : ''}
       {m.operator.title === 'Seasonal'? 
         <span>
          {seasonName}
          </span>
       : ''}
        {/* <FilterInput member={m} key="filterInput" updateMethods={updateMethods}/> */}
        <div style={{ marginBottom: 12 , marginTop: 8}} key={m.index}>
          Alert
          <CheckboxGroup style={{marginLeft:8}} >
            <Checkbox >
              Webhook
              <Input
                key="input"
                style={{
                  width: 400,
                  marginRight: 8,
                  marginLeft: 8

                }}
                value={"https://awesome_api_endpoint.io/webhooks"}
              />
            </Checkbox>
            <Checkbox >
              SMS
              <Select
                value={'Team'}
                // onChange={(operator) => updateMethods.update(m, { ...m, operator })}
                style={{ width: 200, marginRight: 8, marginLeft: 8 }}
              >
                {['Me','Team','Admins'].map(operator => (
                  <Select.Option
                    key={operator}
                    value={operator}
                  >
                    {operator}
                  </Select.Option>
                ))}
              </Select> 
            </Checkbox>
          </CheckboxGroup>
          after 
          <Input
          key="input"
          style={{
            width: 100,
            marginRight: 8,
            marginLeft: 8

          }}
          placeholder="1"
        />
          violation(s)
        <Checkbox style={{ marginLeft: 16 }}>
            Ignore Before
            <Select
                value={'Today'}
                // onChange={(operator) => updateMethods.update(m, { ...m, operator })}
                style={{ width: 120, marginRight: 8, marginLeft: 8 }}
              >
                {['Today','Yesterday','Last Week','Last Month','Date'].map(operator => (
                  <Select.Option
                    key={operator}
                    value={operator}
                  >
                    {operator}
                  </Select.Option>
                ))}
              </Select> 
          </Checkbox>
        </div>
      </div>
    ))}
    <MemberDropdown
      onClick={(m) => add(m)}
      availableMembers={operators}
      type="new"
    >
      {addMemberName}
      <PlusIcon />
    </MemberDropdown>
  </span>
)};

WatcherGroup.propTypes = {
  members: PropTypes.array.isRequired,
  availableMembers: PropTypes.array.isRequired,
  addMemberName: PropTypes.string.isRequired,
  timeDimensions: PropTypes.object,
};

export default WatcherGroup;
