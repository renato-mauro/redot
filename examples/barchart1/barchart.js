function GraficoDeBarras()
{
    this.width    = 1024;
    this.height   = 200;
    this.barWidth = "{width/d.length}";

    /**********************************************************************************************
    <div>
        <svg width="{width+50}" height="{height+50}" style="border: 1px black solid;">
            <g transform="translate(25 25)" style="text-anchor: middle;">
                <include template="Barra" data="{d}" />
            </g>
        </svg>
    </div>
    <div>
        <button onclick="{d.ordenaAsc()}">Crescente</button>
        <button onclick="{d.ordenaDesc()}">Descrescente</button>
        <button onclick="{d.ordenaOriginal()}">Original</button>
        <button onclick="{d.embaralha()}">Embaralha</button>
    </div>
    **********************************************************************************************/
}

function Barra()
{    
    this.color  = "skyblue";
    this.width  = "{parent.barWidth}";
    this.height = "{2*d.qtd}";
    this.x      = "{i*width}";
    this.y      = "{parent.height-height}"
    
    this.select = function(flag)
    {
        this.color = flag ? "orange" : "skyblue";
    }

    /**********************************************************************************************
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
    **********************************************************************************************/
}

var data = [];

data.ordenaAsc = function()
{
    this.sort(function(a,b){return a.qtd-b.qtd});
    redot.changed(this);
}

data.ordenaDesc = function()
{
    this.sort(function(a,b){return b.qtd-a.qtd});
    redot.changed(this);
}

data.ordenaOriginal = function()
{
    this.sort(function(a,b){return a.original-b.original});
    redot.changed(this);
}

data.embaralha = function()
{
    var j, aux;
    for (var i = this.length; i; i -= 1) 
    {
        j = Math.floor(Math.random() * i);
        aux = this[i - 1];
        this[i - 1] = this[j];
        this[j] = aux;
    }
    redot.changed(this);
}

for(var i=0; i<50; i++)
{
    data.push({qtd:~~(Math.random()*91)+10,original:i});
}

redot.applyTemplate("#main", GraficoDeBarras, data);



