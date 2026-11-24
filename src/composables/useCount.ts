/** a count with thousands separators, en-US: 1051 -> "1,051"; `decimals` keeps a fixed precision */
export const formatCount = (n: number, decimals = 0) =>
	n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** a run as "15 Dec 2026, 06:17 UTC"; without a timestamp, the calendar date alone */
export const formatRunTime = (at: string | undefined, date: string) =>
	at
		? `${new Date(at).toLocaleString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })} UTC`
		: new Date(date).toLocaleDateString('en-GB', {
				timeZone: 'UTC',
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			});
