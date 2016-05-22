



function A()
{
	this.init = function()
    {
    	this.range = domain(this.data,"qtd");
    	this.sum = sum(this.data, "qtd");
    	this.stack = stack(this.data, "qtd");
    }

    /*************************************************************
	<p>Total de Elementos: {data.length}</p>
	<p>Soma: {sum}</p>
	<p>Menor Elemento: {range.min} - Maior Elemento: {range.max}</p>
	<ul>
		<include template="B" data="{data}"/>  
	</ul>
    **************************************************************/
}

function B()
{

    /******************************************************************************
	<li>{data.qtd}</li>
    *******************************************************************************/

}

var data = [];
redot.applyTemplate("body",A,data);

var interval;

function f()
{
    data.push({qtd:~~(Math.random()*91)+10});
    if(data.length >= 20)
    {
    	data.sort(function(a,b){return a.qtd-b.qtd});
    	data[10].qtd = 1000000;
    	clearInterval(interval);
    	setTimeout(function(){data.splice(2,10); redot.changed(data)},1000);

    }
    redot.changed(data);
}

interval = setInterval(f,200);



