function GraficoDeBarras(d)
{
	d.width    = 1024;
	d.height   = 200;

	/****************************************************************************************************
	<div>
	    <svg width="{d.width+50}" height="{d.height+50}" style="border: 1px black solid;">
		<g transform="translate(25 25)" style="text-anchor: middle;">
		    <include template="Barra" data="{d}" />
		</g>
	    </svg>
	</div>
	<div>
	    <button disabled="{d.bubbleRunning?'disabled':null}" onclick="{bubbleSort(d)}">bubble</button>
	    <button disabled="{d.bubbleRunning?'disabled':null}" onclick="{embaralha(d)}">embaralha</button>
	</div>
	****************************************************************************************************/
}

function Barra(d, i)
{    
	d.width = 1024/50;
	d.height = 2*d.qtd;
	d.x = i*d.width;
	d.y = 200-d.height;
	d.color = "#ddd";
    
	/***************************************************************************************************
	<g class="bar" style="transform:translate({i*d.width}px,0);">
	    <rect x="1" y="{200-2*d.qtd}" height="{2*d.qtd}" width="{d.width-2}" fill="{d.color}"/>
	    <text x="{d.width/2}" y="{200-2*d.qtd-6}" alignment-baseline="middle">{d.qtd}</text> 
	</g>
	****************************************************************************************************/
}

function embaralha(d)
{
    var j, aux;
    for (var i = d.length; i; i -= 1) 
    {
        j = Math.floor(Math.random() * i);
        aux = d[i - 1];
        d[i - 1] = d[j];
        d[j] = aux;
    }
    for(var i=0; i<d.length; i++)
    {
        d[i].color = "#ddd";
    }
    dvl.fireArrayChange(d);
}

function bubbleSort(d)
{
    var ult = d.length-1;
    var i = 0;
    var trocou = false;

    function step()
    {
        if(i==ult)
        {
            d[ult].color = "skyblue";
            ult--;
            i = 0;
        }
        if(i<ult)
        {
            if(d[i].qtd>d[i+1].qtd)
            {
                var aux = d[i];
                d[i] = d[i+1];
                d[i+1] = aux;
                trocou = true;
                dvl.fireArrayChange(d);
            }
            d[i].color = "#ddd";
            i++;
            d[i].color = "#999";
        }
        if(ult > 0)
        {
            setTimeout(step,50);
        }
        else
        {
            d.bubbleRunning = false;
            d[ult].color = "skyblue";
        }
    }

    d.bubbleRunning = true;
    step();    
}

function main()
{
    var data = [];
    for(var i=0; i<50; i++)
    {
        data.push({qtd:~~(Math.random()*91)+10,original:i});
    }

    
    
    data.bubbleSort = function()
    {        
    }

    dvl.applyTemplate("#main", GraficoDeBarras, data);
}

