class Log 
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
        for (let string in headerList)
        {
            if (string.search('\n') != -1)
                throw "Headers shouldn't contain newline characters!";
        }

        // Add
        this._buffer.push(this._headerList);
    }

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

    //TODO: Make function to get log in CSV format

    get date() { return this._date; }
    get headers() { return this._headerList; }
    get dataPointCount() { return this._headerList.length; }
}