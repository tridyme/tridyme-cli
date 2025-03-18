import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
	Table,
	Input
} from '@material-ui/core';
import { NumericFormat } from 'react-number-format';

const AperçuTableElem = ({
	columns,
	data,
	ui,
	onChange,
	isDisable,
}) => {
	// const [columns, setColumns] = useState(["nom", "valeur", "unitées", "description"]);
	const [rows, setRows] = useState([]);
	useEffect(() => {
		setRows(ui)
	}, []);

	const border = `solid 0px #E8E8E8`;
	// console.log("disable",isDisable)
	// console.log("data",data)
	return (
		<div>
			<Table>
				<thead>
					<tr key={0}>
						{columns?.map((column, index) => (
							<td key={index}>{column}</td>
						))}
					</tr>
				</thead>
				<tbody>
					{rows?.map((row, index) => (
						<tr key={index * 4} style={{ borderTop: border, borderBottom: border, }}>
							{/* {Object.keys(row).map((item, i) => (
								<td key={i}>{`${row[item]}`}</td>
							))} */}
							<td key={index * 4 + 4} width='50%'>{`${data[`${row}`]['description']}`}</td>
							<td key={index * 4 + 1} width='20%'>{`${data[`${row}`]['label']}`}  </td>
							<td key={index * 4 + 2} width='20%' >
								{typeof data[`${row}`]['value'] === "number" ?
									<NumericFormat
										style={{ border: 0, backgroundColor: isDisable === true ? 'white' : 'white',width:'80%',color: `${data[`${row}`]['color'] ? data[`${row}`]['color'] : 'black'}` }}
										type="text"
										onChange={onChange(data[`${row}`]['id'])}
										// value={
										// 	(data[`${row}`]['name'] === 'nb' || data[`${row}`]['name'] === 'h' || data[`${row}`]['name'] === 'b' || data[`${row}`]['name'] === 'wLimQ' || data[`${row}`]['name'] === 'wLimTotal' || data[`${row}`]['name'] === 'serviceClass')
										// 		? data[`${row}`]['value'].toFixed(0)
										// 		: data[`${row}`]['value'].toFixed(2)
										// }
										value={data[`${row}`]['value'].toFixed(2)}
										disabled = {isDisable}
								
									/>
									:
									<Input
										style={{ border: 0, color: "black" }}
										type="text"
										onChange={onChange(data[`${row}`]['id'])}
										value={data[`${row}`]['value']}
										disableUnderline={true}
									/>
								}
							</td>
							<td key={index * 4 + 3} width='20%'>{`${data[`${row}`]['unit'].label}`}</td>
							
						</tr>
					))}
				</tbody>
			</Table>
		</div>
	);
}

export default AperçuTableElem;