/*
@license
dhtmlxScheduler v.4.4.9 Professional

This software is covered by DHTMLX Commercial License. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler.__recurring_template='<div class="dhx_form_repeat"> <form> <div class="dhx_repeat_left"> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="day" />Dagelijks</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="week"/>Wekelijks</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="month" checked />Maandelijks</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="year" />Jaarlijks</label> </div> <div class="dhx_repeat_divider"></div> <div class="dhx_repeat_center"> <div style="display:none;" id="dhx_repeat_day"> <label><input class="dhx_repeat_radio" type="radio" name="day_type" value="d"/>Elke</label><input class="dhx_repeat_text" type="text" name="day_count" value="1" />dag(en)<br /> <label><input class="dhx_repeat_radio" type="radio" name="day_type" checked value="w"/>Elke werkdag</label> </div> <div style="display:none;" id="dhx_repeat_week"> Herhaal elke<input class="dhx_repeat_text" type="text" name="week_count" value="1" />week op de volgende dagen:<br /> <table class="dhx_repeat_days"> <tr> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="1" />Maandag</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="4" />Donderdag</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="2" />Dinsdag</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="5" />Vrijdag</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="3" />Woensdag</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="6" />Zaterdag</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="0" />Zondag</label><br /><br /> </td> </tr> </table> </div> <div id="dhx_repeat_month"> <label><input class="dhx_repeat_radio" type="radio" name="month_type" value="d"/>Herhaal</label><input class="dhx_repeat_text" type="text" name="month_day" value="1" />dag iedere<input class="dhx_repeat_text" type="text" name="month_count" value="1" />maanden<br /> <label><input class="dhx_repeat_radio" type="radio" name="month_type" checked value="w"/>Op</label><input class="dhx_repeat_text" type="text" name="month_week2" value="1" /><select name="month_day2"> <option value="1">Maandag <option value="2">Dinsdag <option value="3">Woensdag <option value="4">Donderdag <option value="5">Vrijdag <option value="6">Zaterdag <option value="0">Zondag </select>iedere<input class="dhx_repeat_text" type="text" name="month_count2" value="1" />maanden<br /> </div> <div style="display:none;" id="dhx_repeat_year"> <label><input class="dhx_repeat_radio" type="radio" name="year_type" value="d"/>Iedere</label><input class="dhx_repeat_text" type="text" name="year_day" value="1" />dag<select name="year_month"><option value="0" selected >Januari<option value="1">Februari<option value="2">Maart<option value="3">April<option value="4">Mei<option value="5">Juni<option value="6">Juli<option value="7">Augustus<option value="8">September<option value="9">Oktober<option value="10">November<option value="11">December</select>maand<br /> <label><input class="dhx_repeat_radio" type="radio" name="year_type" checked value="w"/>Op</label><input class="dhx_repeat_text" type="text" name="year_week2" value="1" /><select name="year_day2"><option value="1" selected >Maandag<option value="2">Dinsdag<option value="3">Woensdag<option value="4">Donderdag<option value="5">Vrijdag<option value="6">Zaterdag<option value="7">Zondag</select>van<select name="year_month2"><option value="0" selected >Januari<option value="1">Februari<option value="2">Maart<option value="3">April<option value="4">Mei<option value="5">Juni<option value="6">Juli<option value="7">Augustus<option value="8">September<option value="9">Oktober<option value="10">November<option value="11">December</select><br /> </div> </div> <div class="dhx_repeat_divider"></div> <div class="dhx_repeat_right"> <label><input class="dhx_repeat_radio" type="radio" name="end" checked/>Geen eind datum</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="end" />Na</label><input class="dhx_repeat_text" type="text" name="occurences_count" value="1" />keren<br /> <label><input class="dhx_repeat_radio" type="radio" name="end" />Eindigd per</label><input class="dhx_repeat_date" type="text" name="date_of_end" value="'+scheduler.config.repeat_date_of_end+'" /><br /> </div> </form> </div> <div style="clear:both"> </div>';

