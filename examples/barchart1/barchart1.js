// Barchart DEMO 01
// Ordinary javascript array. Generating random data.
var data = [];
for(var i=0; i<20; i++) // sample with 20 elements
{
    // generate itegers randomically between 10 and 100
    var randomQtd = parseInt(Math.random()*91)+10;
    // store new object in array with attributes "qtd" and "original",
    // with original object position in the array.
    data.push({qtd:randomQtd,original:i});
}

// BarChart Template
function BarChart()
{
    this.width    = 500; // define width of client area
    this.height   = 200; // define height of client area
    this.barWidth = "{width/d.length}"; // reactive expression
    
    // in reactive expression we can use variables defined in "this" context,
    // global variables, global functions and the implicits variables d, i and parent.
    // d is a reference to the data object. i is the index of d object in 
    // the collection. parent is the parent context. In this case parent is null
    // because BarChart is the root of template.

    // The HTML code bellow is a comment for javascript, but not for redot. 
    // It is a document fragment that generates the underlied data visualization.

    /**********************************************************************************
    <div>
        <svg width="{width+50}" height="{height+50}" style="border: 1px black solid;">
            <g transform="translate(25 25)" style="text-anchor: middle;">
                <include template="{Bar}" data="{d}" />
            </g>
        </svg>
    </div>
    <div>
        <button onclick="{d.sortAsc()}">Sort Ascending</button>
        <button onclick="{d.sortDesc()}">Sort Descending</button>
        <button onclick="{d.startPosition()}">Start Position</button>
        <button onclick="{d.shuffle()}">Shuffle</button>
    </div>
    ********************************************************************************/
}

// Bar Template
function Bar()
{    
    this.color  = "skyblue"; // bar color referenced in fill attribute of rect
    this.width  = "{parent.barWidth}"; // bar width is a reference to parent barWidth
    this.height = "{2*d.qtd}"; // height of bars. qtd is a data attribute
    this.x      = "{i*width}"; // x position of the bar.
    this.y      = "{parent.height-height}"; // y position of the bar
    
    this.select = function(flag) // callback to onmouseover and onmouseout events
    {
        // hovering effect
        this.color = flag ? "orange" : "skyblue";
    }
    
    // Document template for each bar
    /***********************************************************************************
    <g class="bar" style="transform:translate({x}px,0);">
        <rect 
            onmouseover="{select(true)}" 
            onmouseout="{select(false)}" 
            x="1" 
            y="{y}" 
            height="{height}" 
            width="{width-2}" 
            fill="{color}"
        />
        <text x="{width/2}" y="{y-6}" dominant-baseline="middle">{d.qtd}</text> 
    </g>
    ***********************************************************************************/
}

// Attaching to data array sort and shuffle functions

// sorting ascending
data.sortAsc = function()
{
    this.sort(function(a,b){return a.qtd-b.qtd});
    redot.changed(this); // notify to redot that array has changed.
}

// sorting descending
data.sortDesc = function()
{
    this.sort(function(a,b){return b.qtd-a.qtd});
    redot.changed(this); // notify to redot that array has changed.
}

// put data in its original position
data.startPosition = function()
{
    this.sort(function(a,b){return a.original-b.original});
    redot.changed(this); // notify to redot that array has changed.
}

// shuffle Array
data.shuffle = function()
{
    var j, aux;
    for (var i = this.length; i; i -= 1) 
    {
        j = Math.floor(Math.random() * i);
        aux = this[i - 1];
        this[i - 1] = this[j];
        this[j] = aux;
    }
    redot.changed(this); // notify to redot that array has changed.
}

// Do the magic! Call BarChart template with data and append to #main div.
redot.applyTemplate("#main", BarChart, data);     