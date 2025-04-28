export default class Layout {
	protected areas: string[][] = [];
	protected columns: string = '1fr';
	protected rows: string = '1fr';
	protected gap: string | number = 0;

	public setAreas(areas: string[][]) {
		this.areas = areas;
		return this;
	}

	public getAreas() {
		return this.areas;
	}

	public setColumns(columns: string) {
		this.columns = columns;
		return this;
	}

	public getColumns() {
		return this.columns;
	}

	public setRows(rows: string) {
		this.rows = rows;
		return this;
	}

	public getRows() {
		return this.rows;
	}

	public setGap(gap: string | number) {
		this.gap = gap;
		return this;
	}

	public getGap() {
		return this.gap;
	}

	public toJSON() {
		return {
			areas: this.areas,
			uniqueAreas: Array.from(new Set(this.areas.flat())),
			columns: this.columns,
			rows: this.rows,
			gap: this.gap,
		};
	}
}
