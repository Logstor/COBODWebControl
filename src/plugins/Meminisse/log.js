export class Log 
{
    constructor(date, headerList) 
    {
        // Initialize metadata
        this._date = date;
        this._headerList = headerList;
        this._buffer = new Array();

        this._addHeader();
    }

    /**
     * Adds the header as the first line
     */
    _addHeader() 
    {
        // Check for errors
        for (let string in this._headerList)
        {
            if (string.search('\n') != -1)
                throw "Headers shouldn't contain newline characters!";
        }

        // Add
        this._buffer.push(this._headerList);
    }

    /**
     * Adds a new entry to the csv log.
     * 
     * Make sure there's an element to every header, otherwise it throws.
     * 
     * @param {} dataList 
     */
    addEntry(dataList)
    {
        // Make sure length fits
        if (dataList.length != this._headerList.length)
            throw "New entry doesn't contain the correct amount of data points!";

        // Make sure we don't have newline characters
        for (let string in dataList)
        {
            if (string.search('\n') != -1)
                throw "Data points shouldn't contain newlines!";
        }

        // Add to buffer
        this._buffer.push(dataList);
    }

    /**
     * Creates a blob in CSV format.
     * 
     * @returns URI
     */
    createBlob()
    {
        let csvContent = "data:text/csv;charset=utf-8,";

        for (let row in this._buffer)
        {
            for (let it in row)
            {
                csvContent += it + ",";
            }
            csvContent += "\r\n";
        }
        return encodeURI(csvContent);
    }

    get date() { return this._date; }
    get headers() { return this._headerList; }
    get dataPointCount() { return this._headerList.length; }
}