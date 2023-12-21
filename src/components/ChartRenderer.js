import React from "react";
import PropTypes from "prop-types";
import { useCubeQuery } from "@cubejs-client/react";
import { Spin, Row, Col, Statistic, Table } from "antd";
import _ from "lodash";
import {DateTime as dt} from "luxon";
import {
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";
import styled from 'styled-components';

import "./recharts-theme.less";
import moment from "moment";
import numeral from "numeral";

const numberFormatter = item => numeral(item).format("0,0");
const dateFormatter = item => moment(item).format("MMM YY");
const colors = ["#7DB3FF", "#49457B", "#FF7C78"];
const xAxisFormatter = (item) => {
  if (moment(item).isValid()) {
    return dateFormatter(item)
  } else {
    return item;
  }
}

const CartesianChart = ({ resultSet, children, ChartComponent, height }) => (
  <ResponsiveContainer width="100%" height={height}>
    <ChartComponent margin={{ left: -10 }} data={resultSet.chartPivot()}>
      <XAxis axisLine={false} tickLine={false} tickFormatter={xAxisFormatter} dataKey="x" minTickGap={20} />
      <YAxis axisLine={false} tickLine={false} tickFormatter={numberFormatter} />
      <CartesianGrid vertical={false} />
      { children }
      <Legend />
      <Tooltip labelFormatter={dateFormatter} formatter={numberFormatter} />
    </ChartComponent>
  </ResponsiveContainer>
)


// resultSeries.map((series, i) => {
//   console.log("SERIES", series);
// });


const TypeToChartComponent = {
  line: ({ resultSet, height }) => (
    <CartesianChart resultSet={resultSet} height={height} ChartComponent={LineChart}>
      {resultSet.seriesNames().map((series, i) => {
        console.log("SERIES",resultSet);
        return (
        <Line
          key={series.key}
          stackId="a"
          dataKey={series.key}
          name={series.title}
          stroke={colors[i]}
        />
      )})}
    </CartesianChart>
  ),
  bar: ({ resultSet, height }) => (
    <CartesianChart resultSet={resultSet} height={height} ChartComponent={BarChart}>
      {resultSet.seriesNames().map((series, i) => (
        <Bar
          key={series.key}
          stackId="a"
          dataKey={series.key}
          name={series.title}
          fill={colors[i]}
        />
      ))}
    </CartesianChart>
  ),
  area: ({ resultSet, height }) => (
    <CartesianChart resultSet={resultSet} height={height} ChartComponent={AreaChart}>
      {resultSet.seriesNames().slice(0,1).map((series, i) => (
        <Area
          key={series.key}
          stackId="a"
          dataKey={series.key}
          name={series.title}
          stroke={colors[i]}
          fill={colors[i]}
        />
      ))}
       <Area
          key={"LineItems.target"}
          stackId="b"
          dataKey={"LineItems.target"}
          name={"Target"}
          stroke={colors[1]}
          fill={colors[1]}
        />
         <Area
          key={"LineItems.expected"}
          stackId="d"
          dataKey={"LineItems.expected"}
          name={"Expected"}
          stroke={colors[3]}
          fill={colors[3]}
        />
    </CartesianChart>
  ),
  pie: ({ resultSet, height }) => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          isAnimationActive={false}
          data={resultSet.chartPivot()}
          nameKey="x"
          dataKey={resultSet.seriesNames()[0].key}
          fill="#8884d8"
        >
          {resultSet.chartPivot().map((e, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  ),
  table: ({ resultSet }) => (
    <Table
      pagination={false}
      columns={resultSet.tableColumns().map(c => ({ ...c, dataIndex: c.key }))}
      dataSource={resultSet.tablePivot()}
    />
  ),
  number: ({ resultSet }) => (
    <Row
      type="flex"
      justify="center"
      align="middle"
      style={{
        height: "100%"
      }}
    >
      <Col>
        {resultSet.seriesNames().map(s => (
          <Statistic value={resultSet.totalRow()[s.key]} />
        ))}
      </Col>
    </Row>
  )
};
const TypeToMemoChartComponent = Object.keys(TypeToChartComponent)
  .map(key => ({
    [key]: React.memo(TypeToChartComponent[key])
  }))
  .reduce((a, b) => ({ ...a, ...b }));

const SpinContainer = styled.div`
  text-align: center;
  padding: 30px 50px;
  margin-top: 30px;
`
const Spinner = () => (
  <SpinContainer>
    <Spin size="large"/>
  </SpinContainer>
)


// const generateSeries = (series, variant, args) => {
//   switch (variant)
//   {
//     case 'auto-scale' :
//       {
//         return series.map((x) => x*args[0])     // Return series * args[0]
//       }
//     case ''
//   }
// }

const weeklyMultipliers = [0.92, 0.89, 0.95, 1.05, 1.18, 1.01, 1.04] ; // Mon - Sun
const monthlyMultipliers = [1.2, 0.8, 0.6, 1.4]; // Week 1 - Week 4
const yearlyMultipliers = [1.05, 1.1, 0.85, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 1.2, 1.1, 1.1]; // Jan - Dec

const getExpectedValue = (value, renderProps, index) => {
  const timeRange = renderProps.resultSet.loadResponse.query.timeDimensions[0].dateRange;
  let newValue = value;
  if(timeRange && timeRange.length)
  {
    var diff = new moment.duration((dt.fromISO(timeRange[1]) - dt.fromISO(timeRange[0])));
    const days = diff.asDays();
    console.log("DAYS", days)
    if(days< 28)
    {
      newValue = value * weeklyMultipliers[index%7]
    }
    else if(days < 250)
    {
      newValue = value * monthlyMultipliers[index%4]
    }
    else
      newValue = value * yearlyMultipliers[index%12]
  }
  return newValue;
}
const modifyProps = (renderProps) => {
  const newResultSet = 1;
  if(renderProps.resultSet)
  {
    const measure = renderProps.resultSet.query().measures[0];
    const oldData = renderProps.resultSet.rawData();
    const newData = oldData.map((valueArr, index) => {
      return { ...valueArr, 
            "LineItems.target": oldData[index][measure] * 1.20 ,
            "LineItems.average" : oldData[0][measure],
            "LineItems.expected" : getExpectedValue(oldData[index][measure], renderProps, index),
          }
    });
    // return {...renderProps, resultSet: { loadResponse : { data: {...renderProps.resultSet.loadResponse.data, newData} }}};
    _.update(renderProps,'resultSet.loadResponse.data', function(n) {
      return newData
    });
    _.update(renderProps,'resultSet.loadResponse.annotation.measures', function(n) {
      return {...n, 
        'LineItems.target' : { title: 'Target', shortTitle: 'Target'},
        'LineItems.average' : { title: 'Average', shortTitle: 'Average'},
        'LineItems.expected' : { title: 'Expected', shortTitle: 'Expected'}}
    });
    console.log("measures",renderProps.resultSet.loadResponse.query.measures)
    _.update(renderProps,'resultSet.loadResponse.query.measures', function(n) {
      return [...n , "LineItems.target", "LineItems.average", "LineItems.expected"]
    });
    return renderProps;
  }
}

const renderChart = Component => ({ resultSet, error, height }) =>
  (resultSet && <Component height={height} resultSet={resultSet} />) ||
  (error && error.toString()) || <Spinner />;

const ChartRenderer = ({ vizState, chartHeight }) => {
  const { query, chartType } = vizState;
  const component = TypeToMemoChartComponent[chartType];
  const renderProps = useCubeQuery(query);

  // if(renderProps.resultSet)
  //   console.log("RENDERPROPS",renderProps.resultSet.rawData());

  const modifiedProps = modifyProps(renderProps);
  console.log("RENDERPROPS",renderProps, modifiedProps);
  return component && renderChart(component)({ height: chartHeight, ...modifiedProps });
};

ChartRenderer.propTypes = {
  vizState: PropTypes.object,
  cubejsApi: PropTypes.object
};
ChartRenderer.defaultProps = {
  vizState: {},
  chartHeight: 300,
  cubejsApi: null
};
export default ChartRenderer;
