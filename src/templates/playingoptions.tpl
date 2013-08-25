<!--volume-->
<button data-action="volumedown" class="fifty" ><span class="lsf">volumedown</span></button>
<button data-action="volumeup" class="fifty" ><span class="lsf">volumeup</span></button>

<button data-action="randomize" <% if (isRandom) {%>class="active"<%}%>  ><span class="lsf">shuffle</span> random</button>
<button data-action="repeat" <% if (isRepeat) {%>class="active"<%}%> ><span class="lsf">repeat</span>&nbsp;repeat</button>
<button data-action="clear" ><span class="lsf">clear</span>&nbsp;clear playlist</button>
