import "./TodaysSpending.css";
import { FaDollarSign, FaExchangeAlt, FaTags, FaPiggyBank } from "react-icons/fa";



/*
	============================
	   Today's Spendings Card
	============================
*/

function TodaysSpending({ data }) {

	if (!data) return null;

	const today = data.today ?? data;
	
	if (!today) return null;

	const compareToYesterday =
		(data.compareToYesterday ?? today.compareToYesterday) ?? {
			totalSpentDeltaPercent: 0,
			transactionsDeltaPercent: 0,
			categoriesDeltaPercent: 0,
		};
	

	// I extracter the title to a variable
	// because i was having issues with the ' symbol
	const title = "Today's Spending";
	// Check if texts need to say '-x%' or '+x%'
	const spent_sign = (compareToYesterday.totalSpentDeltaPercent ?? 0) >= 0 ? '+' : '-';
	const transactions_sign = (compareToYesterday.transactionsDeltaPercent ?? 0) >= 0 ? '+' : '-';
	const categories_sign = (compareToYesterday.categoriesDeltaPercent ?? 0) >= 0 ? '+' : '-';

	const classes_green = "box-small-text green";
	const classes_yellow = "box-small-text yellow";
	const classes_purple = "box-small-text purple";

	return (
		<div className='card'>
			<div className='card-header'>
				<h1 className='card-title'>{title}</h1>
				<p className='card-subtitle'>Daily Financial Summary</p>
			</div>

			<div className='card-container'>
				<div className='stat-card'>
					<FaDollarSign className="stat-icon yellow" />
					<div className='box-large-text'>€{Number(today.totalSpent ?? 0).toFixed(2)}</div>
					<div className='box-normal-text'>Total spent today</div>
					<div className={classes_yellow}>
						{spent_sign}
						{Math.abs(compareToYesterday.totalSpentDeltaPercent ?? 0)}
					</div>
				</div>

				<div className='stat-card'>
					<FaExchangeAlt className="stat-icon green" />
					<div className='box-large-text'>{today.transactionsCount ?? 0}</div>
					<div className='box-normal-text'>Total Transction</div>
					<div className={classes_green}>
						{transactions_sign}
						{Math.abs(compareToYesterday.transactionsDeltaPercent ?? 0)}
					</div>
				</div>

				<div className='stat-card'>
					<FaTags className="stat-icon purple" />
					<div className='box-large-text'>{today.expenseCategoriesCount ?? 0}</div>
					<div className='box-normal-text'>Expense Categories</div>
					<div className={classes_purple}>
						{categories_sign}
						{Math.abs(compareToYesterday.categoriesDeltaPercent ?? 0)}
					</div>
				</div>

				<div className='stat-card'>
					<FaPiggyBank className="stat-icon green" />
					<div className='box-large-text'>2</div>
					<div className='box-normal-text'>New Saving Goals</div>
					<div className={classes_green}>
						{Math.abs(compareToYesterday.categoriesDeltaPercent ?? 0)}
					
					</div>
				</div>
			</div>
		</div>
	);
}

export default TodaysSpending;
