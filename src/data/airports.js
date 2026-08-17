"use strict";
/* Airport table — OurAirports (public domain), filtered to scheduled-service + all large airports.
   Fields: IATA|ICAO|name|city|country|lat|lon|elev_ft|tzIndex|rank  */
const TZ=["","Africa/Abidjan","Africa/Accra","Africa/Addis_Ababa","Africa/Algiers","Africa/Asmara","Africa/Bamako","Africa/Bangui","Africa/Banjul","Africa/Bissau","Africa/Blantyre","Africa/Brazzaville","Africa/Bujumbura","Africa/Cairo","Africa/Casablanca","Africa/Conakry","Africa/Dakar","Africa/Dar_es_Salaam","Africa/Djibouti","Africa/Douala","Africa/El_Aaiun","Africa/Freetown","Africa/Gaborone","Africa/Harare","Africa/Johannesburg","Africa/Juba","Africa/Kampala","Africa/Khartoum","Africa/Kigali","Africa/Kinshasa","Africa/Lagos","Africa/Libreville","Africa/Lome","Africa/Luanda","Africa/Lubumbashi","Africa/Lusaka","Africa/Malabo","Africa/Maputo","Africa/Maseru","Africa/Mbabane","Africa/Mogadishu","Africa/Monrovia","Africa/Nairobi","Africa/Ndjamena","Africa/Niamey","Africa/Nouakchott","Africa/Ouagadougou","Africa/Porto-Novo","Africa/Sao_Tome","Africa/Tripoli","Africa/Tunis","Africa/Windhoek","America/Adak","America/Anchorage","America/Anguilla","America/Antigua","America/Araguaina","America/Argentina/Buenos_Aires","America/Argentina/Catamarca","America/Argentina/Cordoba","America/Argentina/Jujuy","America/Argentina/La_Rioja","America/Argentina/Mendoza","America/Argentina/Rio_Gallegos","America/Argentina/Salta","America/Argentina/San_Juan","America/Argentina/San_Luis","America/Argentina/Tucuman","America/Argentina/Ushuaia","America/Aruba","America/Asuncion","America/Atikokan","America/Bahia","America/Bahia_Banderas","America/Barbados","America/Belem","America/Belize","America/Blanc-Sablon","America/Boa_Vista","America/Bogota","America/Boise","America/Cambridge_Bay","America/Campo_Grande","America/Cancun","America/Caracas","America/Cayenne","America/Cayman","America/Chicago","America/Chihuahua","America/Ciudad_Juarez","America/Costa_Rica","America/Cuiaba","America/Curacao","America/Dawson","America/Dawson_Creek","America/Denver","America/Detroit","America/Dominica","America/Edmonton","America/El_Salvador","America/Fort_Nelson","America/Fortaleza","America/Glace_Bay","America/Goose_Bay","America/Grand_Turk","America/Grenada","America/Guadeloupe","America/Guatemala","America/Guayaquil","America/Guyana","America/Halifax","America/Havana","America/Hermosillo","America/Indiana/Indianapolis","America/Inuvik","America/Iqaluit","America/Jamaica","America/Juneau","America/Kentucky/Louisville","America/Kralendijk","America/La_Paz","America/Lima","America/Los_Angeles","America/Lower_Princes","America/Maceio","America/Managua","America/Manaus","America/Martinique","America/Matamoros","America/Mazatlan","America/Menominee","America/Merida","America/Mexico_City","America/Miquelon","America/Moncton","America/Monterrey","America/Montevideo","America/Montserrat","America/Nassau","America/New_York","America/Nome","America/Noronha","America/Nuuk","America/Panama","America/Paramaribo","America/Phoenix","America/Port-au-Prince","America/Port_of_Spain","America/Porto_Velho","America/Puerto_Rico","America/Punta_Arenas","America/Rankin_Inlet","America/Recife","America/Regina","America/Resolute","America/Rio_Branco","America/Santarem","America/Santiago","America/Santo_Domingo","America/Sao_Paulo","America/Scoresbysund","America/Sitka","America/St_Barthelemy","America/St_Johns","America/St_Kitts","America/St_Lucia","America/St_Thomas","America/St_Vincent","America/Swift_Current","America/Tegucigalpa","America/Thule","America/Tijuana","America/Toronto","America/Tortola","America/Vancouver","America/Whitehorse","America/Winnipeg","America/Yakutat","Arctic/Longyearbyen","Asia/Aden","Asia/Almaty","Asia/Amman","Asia/Anadyr","Asia/Aqtau","Asia/Aqtobe","Asia/Ashgabat","Asia/Atyrau","Asia/Baghdad","Asia/Bahrain","Asia/Baku","Asia/Bangkok","Asia/Barnaul","Asia/Beirut","Asia/Bishkek","Asia/Brunei","Asia/Chita","Asia/Choibalsan","Asia/Colombo","Asia/Damascus","Asia/Dhaka","Asia/Dili","Asia/Dubai","Asia/Dushanbe","Asia/Famagusta","Asia/Ho_Chi_Minh","Asia/Hong_Kong","Asia/Hovd","Asia/Irkutsk","Asia/Jakarta","Asia/Jayapura","Asia/Jerusalem","Asia/Kabul","Asia/Kamchatka","Asia/Karachi","Asia/Kathmandu","Asia/Khandyga","Asia/Kolkata","Asia/Krasnoyarsk","Asia/Kuala_Lumpur","Asia/Kuching","Asia/Kuwait","Asia/Macau","Asia/Magadan","Asia/Makassar","Asia/Manila","Asia/Muscat","Asia/Nicosia","Asia/Novokuznetsk","Asia/Novosibirsk","Asia/Omsk","Asia/Oral","Asia/Phnom_Penh","Asia/Pontianak","Asia/Pyongyang","Asia/Qatar","Asia/Qostanay","Asia/Qyzylorda","Asia/Riyadh","Asia/Sakhalin","Asia/Samarkand","Asia/Seoul","Asia/Shanghai","Asia/Singapore","Asia/Srednekolymsk","Asia/Taipei","Asia/Tashkent","Asia/Tbilisi","Asia/Tehran","Asia/Thimphu","Asia/Tokyo","Asia/Tomsk","Asia/Ulaanbaatar","Asia/Ust-Nera","Asia/Vientiane","Asia/Vladivostok","Asia/Yakutsk","Asia/Yangon","Asia/Yekaterinburg","Asia/Yerevan","Atlantic/Azores","Atlantic/Bermuda","Atlantic/Canary","Atlantic/Cape_Verde","Atlantic/Faroe","Atlantic/Madeira","Atlantic/Reykjavik","Atlantic/St_Helena","Atlantic/Stanley","Australia/Adelaide","Australia/Brisbane","Australia/Broken_Hill","Australia/Darwin","Australia/Hobart","Australia/Lindeman","Australia/Lord_Howe","Australia/Melbourne","Australia/Perth","Australia/Sydney","Europe/Amsterdam","Europe/Astrakhan","Europe/Athens","Europe/Belgrade","Europe/Berlin","Europe/Bratislava","Europe/Brussels","Europe/Bucharest","Europe/Budapest","Europe/Chisinau","Europe/Copenhagen","Europe/Dublin","Europe/Gibraltar","Europe/Guernsey","Europe/Helsinki","Europe/Isle_of_Man","Europe/Istanbul","Europe/Jersey","Europe/Kaliningrad","Europe/Kirov","Europe/Kyiv","Europe/Lisbon","Europe/Ljubljana","Europe/London","Europe/Luxembourg","Europe/Madrid","Europe/Malta","Europe/Mariehamn","Europe/Minsk","Europe/Moscow","Europe/Oslo","Europe/Paris","Europe/Podgorica","Europe/Prague","Europe/Riga","Europe/Rome","Europe/Samara","Europe/Sarajevo","Europe/Saratov","Europe/Simferopol","Europe/Skopje","Europe/Sofia","Europe/Stockholm","Europe/Tallinn","Europe/Tirane","Europe/Ulyanovsk","Europe/Vienna","Europe/Vilnius","Europe/Volgograd","Europe/Warsaw","Europe/Zagreb","Europe/Zurich","Indian/Antananarivo","Indian/Christmas","Indian/Cocos","Indian/Comoro","Indian/Mahe","Indian/Maldives","Indian/Mauritius","Indian/Mayotte","Indian/Reunion","Pacific/Apia","Pacific/Auckland","Pacific/Bougainville","Pacific/Chatham","Pacific/Chuuk","Pacific/Easter","Pacific/Efate","Pacific/Fiji","Pacific/Funafuti","Pacific/Galapagos","Pacific/Gambier","Pacific/Guadalcanal","Pacific/Guam","Pacific/Honolulu","Pacific/Kiritimati","Pacific/Kosrae","Pacific/Kwajalein","Pacific/Majuro","Pacific/Marquesas","Pacific/Nauru","Pacific/Niue","Pacific/Norfolk","Pacific/Noumea","Pacific/Pago_Pago","Pacific/Palau","Pacific/Pohnpei","Pacific/Port_Moresby","Pacific/Rarotonga","Pacific/Saipan","Pacific/Tahiti","Pacific/Tarawa","Pacific/Tongatapu","Pacific/Wake","Pacific/Wallis"];
const AP_RAW=`AAC|HEAR|El Arish||EG|31.0553|33.828|118|13|0
AAE|DABB|Annaba Rabah Bitat||DZ|36.8268|7.8133|16|4|0
AAL|EKYT|Aalborg||DK|57.0948|9.8499|10|288|0
AAN|OMAL|Al Ain||AE|24.2617|55.6092|869|201|0
AAR|EKAH|Aarhus||DK|56.3033|10.6183|82|288|0
ABA|UNAA|Abakan||RU|53.74|91.385|831|217|0
ABB|DNAS|Asaba||NG|6.2042|6.6653|305|30|0
ABD|OIAA|Abadan Ayatollah Jami||IR|30.3679|48.2301|10|247|0
ABJ|DIAP|Félix-Houphouët-Boigny|Abidjan|CI|5.2614|-3.9263|21|1|0
ABQ|KABQ|Albuquerque International Sunport||US|35.04|-106.609|5355|95|0
ABV|DNAA|Nnamdi Azikiwe|Abuja|NG|9.0068|7.2632|1123|30|0
ABZ|EGPD|Aberdeen||GB|57.2019|-2.1978|215|301|0
ACA|MMAA|General Juan N. Álvarez|Acapulco|MX|16.7571|-99.7531|16|132|0
ACC|DGAA|Kotoka|Accra|GH|5.6052|-0.1668|205|2|0
ACE|GCRR|César Manrique-Lanzarote|San Bartolomé|ES|28.9455|-13.6052|46|261|0
ADB|LTBJ|Adnan Menderes|Gaziemir|TR|38.2924|27.157|412|294|0
ADD|HAAB|Addis Ababa Bole||ET|8.9779|38.7993|7630|3|0
ADE|OYAA|Aden||YE|12.8296|45.03|7|179|0
ADJ|OJAM|Marka International (Amman Civil)||JO|31.9727|35.9916|2555|181|0
ADL|YPAD|Adelaide||AU|-34.9475|138.533|20|268|0
ADZ|SKSP|Gustavo Rojas Pinilla|San Andrés|CO|12.5836|-81.7112|19|79|0
AEP|SABE|Aeroparque Jorge Newbery|Buenos Aires|AR|-34.5594|-58.4155|18|57|0
AER|URSS|Sochi||RU|43.4499|39.9566|89|307|0
AES|ENAL|Ålesund||NO|62.5604|6.1108|69|308|0
AEY|BIAR|Akureyri||IS|65.6566|-18.072|6|265|0
AGA|GMAD|Al Massira|Agadir (Temsia)|MA|30.3225|-9.412|250|14|0
AGP|LEMG|Málaga-Costa del Sol||ES|36.6749|-4.4991|53|303|0
AGT|SGES|Guaraní|Ciudad del Este|PY|-25.4572|-54.8395|846|70|0
AGU|MMAS|Aguascalientes||MX|21.6996|-102.318|6112|132|0
AHB|OEAB|Abha||SA|18.2404|42.6566|6858|237|0
AJF|OESK|Al-Jawf||SA|29.7833|40.1009|2261|237|0
AKL|NZAA|Auckland||NZ|-37.012|174.786|23|340|0
AKX|UATT|Aktobe||KZ|50.2481|57.2041|738|184|0
ALA|UAAA|Almaty||KZ|43.3543|77.0428|2234|180|0
ALB|KALB|Albany||US|42.7483|-73.8017|285|139|0
ALC|LEAL|Alicante-Elche Miguel Hernández||ES|38.2822|-0.5582|142|303|0
ALG|DAAG|Houari Boumediene|Algiers|DZ|36.6939|3.2145|82|4|0
ALP|OSAP|Aleppo||SY|36.1813|37.2269|1276|198|0
AMD|VAAH|Sardar Vallabh Patel|Ahmedabad|IN|23.0772|72.6347|189|216|0
AMM|OJAI|Queen Alia|Amman|JO|31.7226|35.9932|2395|181|0
AMQ|WAPP|Pattimura|Ambon|ID|-3.7103|128.089|33|209|0
AMS|EHAM|Amsterdam Airport Schiphol||NL|52.3086|4.7639|-11|278|0
ANC|PANC|Ted Stevens Anchorage||US|61.179|-149.993|152|53|0
ANF|SCFA|Andrés Sabella Gálvez|Antofagasta|CL|-23.4453|-70.4452|455|157|0
ANU|TAPA|V. C. Bird|Osbourn|AG|17.1367|-61.7927|62|55|0
AOE|LTBY|Hasan Polatkan|Eskişehir|TR|39.8116|30.5193|2588|294|0
AOJ|RJSA|Aomori||JP|40.7338|140.69|664|249|0
APL|FQNP|Nampula||MZ|-15.1056|39.2818|1444|37|0
APW|NSFA|Faleolo|Apia|WS|-13.83|-172.008|58|339|0
AQI|OEPA|Qaisumah–Hafar Al-Batin||SA|28.3357|46.1271|1174|237|0
AQJ|OJAQ|King Hussein|Aqaba|JO|29.6116|35.0181|175|181|0
AQP|SPQU|Rodríguez Ballón|Arequipa|PE|-16.3408|-71.5695|8405|121|0
ARN|ESSA|Stockholm-Arlanda||SE|59.6485|17.9288|137|320|0
ASB|UTAA|Ashgabat||TM|37.9868|58.361|692|185|0
ASF|URWA|Astrakhan Narimanovo Boris M. Kustodiev||RU|46.2828|48.0105|-65|279|0
ASK|DIYO|Yamoussoukro||CI|6.9032|-5.3656|699|1|0
ASR|LTAU|Kayseri Erkilet||TR|38.7704|35.4954|3463|294|0
ASU|SGAS|Silvio Pettirossi|Asunción|PY|-25.2402|-57.5192|292|70|0
ASW|HESN|Aswan||EG|23.9611|32.8204|650|13|0
ATH|LGAV|Athens Eleftherios Venizelos|Spata-Artemida|GR|37.9364|23.9445|308|280|0
ATL|KATL|Hartsfield Jackson Atlanta||US|33.6367|-84.4281|1026|139|0
ATQ|VIAR|Sri Guru Ram Das Ji|Amritsar|IN|31.7096|74.7973|756|216|0
ATZ|HEAT|Asyut||EG|27.046|31.0128|748|13|0
AUA|TNCA|Queen Beatrix|Oranjestad|AW|12.5011|-70.0143|60|69|0
AUH|OMAA|Zayed|Abu Dhabi|AE|24.441|54.6492|88|201|0
AUS|KAUS|Austin Bergstrom||US|30.1975|-97.662|542|87|0
AVV|YMAV|Melbourne Avalon|Geelong/Melbourne|AU|-38.0403|144.467|35|275|0
AWA|HALA|Hawassa||ET|7.1006|38.3965|5450|3|0
AWZ|OIAW|Qasem Soleimani|Ahvaz|IR|31.3364|48.7638|66|247|0
AYT|LTAI|Antalya||TR|36.8987|30.8005|177|294|0
AZI|OMAD|Al Bateen Executive|Abu Dhabi|AE|24.4271|54.4599|16|201|0
BAH|OBBI|Bahrain|Manama|BH|26.2673|50.6376|6|188|0
BAQ|SKBQ|Ernesto Cortissoz|Barranquilla|CO|10.8896|-74.7808|98|79|0
BAV|ZBOW|Baotou Donghe||CN|40.56|109.997|3321|241|0
BAX|UNBB|Barnaul Gherman Titov||RU|53.3613|83.5397|837|191|0
BBI|VEBS|Biju Patnaik|Bhubaneswar|IN|20.251|85.8147|138|216|0
BBK|FBKE|Kasane||BW|-17.8317|25.1662|3289|22|0
BBU|LRBS|Bucharest Băneasa Aurel Vlaicu||RO|44.5031|26.1029|297|285|0
BCD|RPVB|Bacolod-Silay|Bacolod City|PH|10.7762|123.019|82|224|0
BCM|LRBC|Bacău George Enescu||RO|46.5219|26.9103|607|285|0
BCN|LEBL|Josep Tarradellas Barcelona-El Prat||ES|41.2971|2.0785|12|303|0
BCU|DNBC|Sir Abubakar Tafawa Balewa Bauchi State||NG|10.4828|9.744|1965|0|0
BDA|TXKF|L.F. Wade|Hamilton|BM|32.3638|-64.6782|12|260|0
BDJ|WAOO|Syamsudin Noor|Banjarbaru|ID|-3.4401|114.761|66|223|0
BDL|KBDL|Bradley|Hartford|US|41.9386|-72.688|173|139|0
BDQ|VABO|Vadodara||IN|22.3362|73.2263|129|216|0
BDS|LIBR|Brindisi||IT|40.6576|17.947|47|313|0
BEG|LYBE|Belgrade Nikola Tesla||RS|44.8184|20.3091|335|281|0
BEL|SBBE|Val de Cans/Júlio Cezar Ribeiro|Belém|BR|-1.3793|-48.4762|54|75|0
BEM|GMMD|Beni Mellal|Oulad Yaich|MA|32.4019|-6.3159|1694|14|0
BEN|HLLB|Benina||LY|32.0968|20.2695|433|49|0
BER|EDDB|Berlin Brandenburg||DE|52.3617|13.5023|157|282|0
BES|LFRB|Brest Bretagne airport||FR|48.4479|-4.4185|325|309|0
BEW|FQBR|Beira||MZ|-19.7964|34.9076|33|37|0
BEY|OLBA|Beirut Rafic Hariri||LB|33.8198|35.4874|87|192|0
BFN|FABL|Bram Fischer|Bloemfontein|ZA|-29.0927|26.3024|4457|24|0
BFS|EGAA|Belfast||GB|54.6575|-6.2158|268|301|0
BGF|FEFF|Bangui M'Poko||CF|4.3985|18.5188|1208|7|0
BGI|TBPB|Grantley Adams|Bridgetown|BB|13.0747|-59.491|169|74|0
BGO|ENBR|Bergen Airport, Flesland||NO|60.2934|5.2181|170|308|0
BGW|ORBI|Baghdad International Airport / New Al Muthana||IQ|33.2625|44.2346|114|187|0
BGY|LIME|Il Caravaggio|Orio al Serio (BG)|IT|45.6694|9.7089|782|313|0
BHK|UZSB|Bukhara||UZ|39.7753|64.4823|751|239|0
BHM|KBHM|Birmingham-Shuttlesworth||US|33.5629|-86.7507|650|87|0
BHO|VABP|Raja Bhoj|Bhopal|IN|23.2875|77.3374|1711|216|0
BHX|EGBB|Birmingham|Birmingham, West Midlands|GB|52.4539|-1.748|327|301|0
BIA|LFKB|Bastia-Poretta International airport||FR|42.5527|9.4837|26|309|0
BIO|LEBB|Bilbao||ES|43.3011|-2.9106|138|303|0
BJA|DAAE|Soummam–Abane Ramdane|Béjaïa|DZ|36.7125|5.0699|20|4|0
BJL|GBYD|Banjul|Banjul (Yundum)|GM|13.338|-16.6522|95|8|0
BJM|HBBA|Bujumbura Melchior Ndadaye||BI|-3.324|29.3185|2582|12|0
BJV|LTFE|Milas Bodrum||TR|37.2493|27.664|21|294|0
BJX|MMLO|Guanajuato|Silao|MX|20.9927|-101.48|5956|132|0
BKI|WBKK|Kota Kinabalu||MY|5.9327|116.049|10|219|0
BKK|VTBS|Suvarnabhumi|Bangkok|TH|13.6811|100.747|5|190|0
BKO|GABS|Modibo Keita|Bamako|ML|12.5335|-7.9499|1247|6|0
BLA|SVBC|General José Antonio Anzoategui|Barcelona|VE|10.1111|-64.6922|30|84|0
BLJ|DABT|Batna Mostefa Ben Boulaid||DZ|35.7521|6.3086|2697|4|0
BLL|EKBI|Billund||DK|55.7403|9.157|247|288|0
BLQ|LIPE|Bologna Guglielmo Marconi||IT|44.5354|11.2887|123|313|0
BLR|VOBL|Kempegowda International Airport Bengaluru||IN|13.1979|77.7063|3000|216|0
BLZ|FWCL|Chileka|Blantyre|MW|-15.6772|34.9723|2555|10|0
BME|YBRM|Broome||AU|-17.9492|122.228|56|276|0
BNA|KBNA|Nashville||US|36.1245|-86.6782|599|87|0
BND|OIKB|Bandar Abbas||IR|27.2183|56.3778|22|247|0
BNE|YBBN|Brisbane||AU|-27.3842|153.117|13|269|0
BNX|LQBK|Banja Luka|Mahovljani|BA|44.9414|17.2975|400|315|0
BOD|LFBD|Bordeaux–Mérignac||FR|44.8287|-0.7154|162|309|0
BOG|SKBO|El Dorado|Bogota|CO|4.7016|-74.1469|8361|79|0
BOI|KBOI|Boise Air Terminal/Gowen Field||US|43.5644|-116.223|2871|80|0
BOJ|LBBG|Burgas||BG|42.5699|27.5152|135|319|0
BOM|VABB|Chhatrapati Shivaji Maharaj|Mumbai|IN|19.0887|72.8679|39|216|0
BON|TNCB|Flamingo|Kralendijk|BQ|12.131|-68.2685|20|119|0
BOO|ENBO|Bodø||NO|67.2692|14.3653|42|308|0
BOS|KBOS|Boston Logan||US|42.362|-71.0079|20|139|0
BOY|DFOO|Bobo Dioulasso||BF|11.1601|-4.331|1511|46|0
BPN|WALL|Sultan Aji Muhammad Sulaiman Sepinggan|Balikpapan|ID|-1.2683|116.894|12|223|0
BPS|SBPS|Porto Seguro||BR|-16.4384|-39.0806|169|72|0
BQT|UMBB|Brest||BY|52.1081|23.8968|468|306|0
BRC|SAZS|Teniente Luis Candelaria|San Carlos de Bariloche|AR|-41.1512|-71.1575|2774|64|0
BRE|EDDW|Bremen||DE|53.0468|8.7893|14|282|0
BRI|LIBD|Bari Karol Wojtyła||IT|41.1389|16.7606|193|313|0
BRM|SVBM|Jacinto Lara|Barquisimeto|VE|10.0427|-69.3586|2042|84|0
BRS|EGGD|Bristol||GB|51.3823|-2.7165|622|301|0
BRU|EBBR|Brussels|Zaventem|BE|50.9014|4.4844|175|284|0
BSA|HCMF|Bender Qassim|Bosaso|SO|11.2752|49.1392|3|40|0
BSB|SBBR|Presidente Juscelino Kubitschek|Brasília|BR|-15.8692|-47.9208|3497|159|0
BSG|FGBT|Bata||GQ|1.9055|9.8057|13|36|0
BSK|DAUB|Biskra - Mohamed Khider||DZ|34.7932|5.7389|289|4|0
BSL|LFSB|EuroAirport Basel–Mulhouse–Freiburg|Bâle / Mulhouse|FR|47.6007|7.5211|885|309|0
BSR|ORMM|Basra||IQ|30.5491|47.6621|11|187|0
BSZ|UCFM|Manas|Bishkek|KG|43.0613|74.4776|2058|193|0
BTH|WIDD|Hang Nadim|Batam|ID|1.121|104.119|126|208|0
BTJ|WITT|Sultan Iskandar Muda|Banda Aceh|ID|5.5251|95.42|65|208|0
BTS|LZIB|M. R. Štefánik|Bratislava|SK|48.1702|17.2127|436|283|0
BUD|LHBP|Budapest Liszt Ferenc||HU|47.4302|19.2624|495|286|0
BUF|KBUF|Buffalo Niagara||US|42.9405|-78.7322|728|139|0
BUQ|FVJN|Joshua Mqabuko Nkomo|Bulawayo|ZW|-20.0163|28.6229|4359|23|0
BUR|KBUR|Hollywood Burbank/Bob Hope||US|34.2028|-118.358|778|122|0
BUS|UGSB|Alexander Kartveli Batumi||GE|41.6094|41.6003|105|246|0
BVA|LFOB|Beauvais-Tillé airport||FR|49.4544|2.1128|359|309|0
BVB|SBBV|Atlas Brasil Cantanhede|Boa Vista|BR|2.8462|-60.6906|276|78|0
BVC|GVBA|Aristides Pereira|Rabil|CV|16.1365|-22.8889|69|262|0
BWA|VNBW|Gautam Buddha|Siddharthanagar (Bhairahawa)|NP|27.5046|83.4104|358|214|0
BWI|KBWI|Baltimore/Washington International Thurgood Marshall||US|39.1754|-76.6683|146|139|0
BWN|WBSB|Brunei|Bandar Seri Begawan|BN|4.9442|114.928|73|194|0
BXY|UAOL|Baikonur Krayniy||KZ|45.622|63.2108|317|236|0
BZE|MZBZ|Philip S. W. Goldson|Belize City|BZ|17.54|-88.3036|15|76|0
BZV|FCBB|Maya-Maya|Brazzaville|CG|-4.2517|15.253|1048|11|0
CAG|LIEE|Cagliari Elmas||IT|39.2515|9.0543|13|313|0
CAI|HECA|Cairo||EG|30.1115|31.3967|322|13|0
CAN|ZGGG|Guangzhou Baiyun|Guangzhou (Huadu)|CN|23.3924|113.299|50|241|0
CAP|MTCH|Cap Haitien||HT|19.7255|-72.2007|10|146|0
CAY|SOCA|Cayenne – Félix Eboué|Matoury|GF|4.82|-52.3613|26|85|0
CBB|SLCB|Jorge Wilsterman|Cochabamba|BO|-17.4211|-66.1771|8360|120|0
CCJ|VOCL|Calicut||IN|11.136|75.9552|342|216|0
CCK|YPCC|Cocos (Keeling) Islands|West Island|CC|-12.1922|96.8341|10|332|0
CCP|SCIE|Carriel Sur|Concepcion|CL|-36.7724|-73.0628|26|157|0
CCS|SVMI|Maiquetía Simón Bolívar||VE|10.6022|-66.9912|234|84|0
CCU|VECC|Netaji Subhash Chandra Bose|Kolkata|IN|22.654|88.4476|16|216|0
CDG|LFPG|Charles de Gaulle|Paris (Roissy-en-France, Val-d'Oise)|FR|49.009|2.5541|392|309|0
CEB|RPVM|Mactan Cebu|Cebu City/Lapu-Lapu City|PH|10.3093|123.98|31|224|0
CEI|VTCT|Mae Fah Luang - Chiang Rai||TH|19.9523|99.8829|1280|190|0
CEK|USCC|Kurchatov Chelyabinsk||RU|55.3031|61.5049|769|257|0
CFE|LFLC|Clermont-Ferrand Auvergne airport||FR|45.7867|3.1692|1090|309|0
CFK|DAOI|Chlef Aboubakr Belkaid||DZ|36.2166|1.3411|463|4|0
CFU|LGKR|Corfu Ioannis Kapodistrias|Kerkyra (Corfu)|GR|39.6014|19.9122|6|280|0
CGB|SBCY|Várzea Grande–Marechal Rondon|Cuiabá|BR|-15.6529|-56.1167|617|91|0
CGH|SBSP|Congonhas–Deputado Freitas Nobre|São Paulo|BR|-23.6277|-46.6546|2631|159|0
CGK|WIII|Soekarno-Hatta|Jakarta|ID|-6.1256|106.656|34|208|0
CGN|EDDK|Cologne Bonn|Köln (Cologne)|DE|50.8659|7.1427|302|282|0
CGO|ZHCC|Zhengzhou Xinzheng||CN|34.5265|113.849|495|241|0
CGP|VGEG|Shah Amanat|Chattogram (Chittagong)|BD|22.2496|91.8133|12|199|0
CGQ|ZYCC|Changchun Longjia||CN|43.9962|125.685|706|241|0
CGY|RPMY|Laguindingan||PH|8.6122|124.457|190|224|0
CHC|NZCH|Christchurch||NZ|-43.489|172.532|123|340|0
CHQ|LGSA|Chania|Souda|GR|35.5312|24.1507|490|280|0
CHS|KCHS|Charleston||US|32.8962|-80.0382|46|139|0
CIA|LIRA|Ciampino–G. B. Pastine|Rome|IT|41.7988|12.5953|427|313|0
CIT|UAII|Shymkent||KZ|42.365|69.4756|1385|180|0
CIX|SPHI|Capitán FAP José A. Quiñones González|Chiclayo|PE|-6.7892|-79.8283|97|121|0
CJB|VOCB|Coimbatore||IN|11.03|77.0434|1324|216|0
CJJ|RKTU|Cheongju International Airport/Cheongju Air Base (K-59/G-513)||KR|36.7156|127.5|191|240|0
CJS|MMCS|Abraham González|Ciudad Juárez|MX|31.6367|-106.428|3904|89|0
CJU|RKPC|Jeju|Jeju City|KR|33.5121|126.493|118|240|0
CKG|ZUCK|Chongqing Jiangbei||CN|29.7123|106.652|1365|241|0
CKY|GUCY|Ahmed Sékou Touré|Conakry|GN|9.5769|-13.612|72|15|0
CLE|KCLE|Cleveland Hopkins||US|41.4117|-81.8498|791|139|0
CLJ|LRCL|Avram Iancu Cluj|Cluj-Napoca|RO|46.786|23.6857|1039|285|0
CLO|SKCL|Alfonso Bonilla Aragon|Cali|CO|3.5427|-76.3819|3162|79|0
CLT|KCLT|Charlotte Douglas||US|35.214|-80.9431|748|139|0
CMB|VCBI|Bandaranaike International Colombo||LK|7.1808|79.8841|30|197|0
CMH|KCMH|John Glenn Columbus||US|39.998|-82.8919|815|139|0
CMN|GMMN|Mohammed V|Casablanca|MA|33.3675|-7.59|656|14|0
CMW|MUCM|Ignacio Agramonte|Camaguey|CU|21.4199|-77.848|413|111|0
CND|LRCK|Mihail Kogălniceanu|Constanța|RO|44.3622|28.4883|353|285|0
CNF|SBCF|Tancredo Neves|Belo Horizonte|BR|-19.6357|-43.9669|2721|159|0
CNN|VOKN|Kannur||IN|11.9163|75.545|330|216|0
CNS|YBCS|Cairns||AU|-16.8789|145.75|10|269|0
CNX|VTCC|Chiang Mai||TH|18.7668|98.9626|1036|190|0
COK|VOCI|Cochin|Kochi|IN|10.151|76.4008|30|216|0
COO|DBBB|Cotonou Cadjehoun||BJ|6.3572|2.3843|19|47|0
COR|SACO|Ingeniero Aeronáutico Ambrosio L.V. Taravella|Cordoba|AR|-31.3123|-64.2083|1604|59|0
COS|KCOS|City of Colorado Springs||US|38.8058|-104.701|6187|95|0
COV|LTDB|Çukurova|Tarsus|TR|36.8915|35.0712|35|294|0
CPH|EKCH|Copenhagen Kastrup||DK|55.6179|12.656|17|288|0
CPT|FACT|Cape Town||ZA|-33.974|18.6043|151|24|0
CRA|LRCV|Craiova||RO|44.3181|23.8886|626|285|0
CRD|SAVC|General Enrique Mosconi|Comodoro Rivadavia|AR|-45.7869|-67.4634|189|58|0
CRK|RPLC|Clark International Airport / Clark|Mabalacat|PH|15.186|120.56|484|224|0
CRL|EBCI|Brussels South Charleroi||BE|50.462|4.4596|614|284|0
CRZ|UTAV|Türkmenabat||TM|38.9307|63.564|649|185|0
CSX|ZGHA|Changsha Huanghua|Changsha (Changsha)|CN|28.1892|113.22|217|241|0
CTA|LICC|Catania-Fontanarossa||IT|37.4668|15.0664|39|313|0
CTG|SKCG|Rafael Nuñez|Cartagena|CO|10.4424|-75.513|4|79|0
CTS|RJCC|New Chitose|Sapporo|JP|42.7748|141.69|82|249|0
CTU|ZUUU|Chengdu Shuangliu|Chengdu (Shuangliu)|CN|30.5583|103.946|1625|241|0
CUL|MMCL|Bachigualato Federal|Culiacán|MX|24.765|-107.475|108|129|0
CUN|MMUN|Cancún||MX|21.0408|-86.8735|22|83|0
CUR|TNCC|Hato|Willemstad|CW|12.1889|-68.9598|29|92|0
CUU|MMCU|General Roberto Fierro Villalobos|Chihuahua|MX|28.7026|-105.964|4462|88|0
CUZ|SPZO|Alejandro Velasco Astete|Cusco|PE|-13.5357|-71.9388|10860|121|0
CVG|KCVG|Cincinnati Northern Kentucky|Cincinnati / Covington|US|39.0488|-84.6678|896|139|0
CWB|SBCT|Curitiba-Afonso Pena||BR|-25.5285|-49.1758|2988|159|0
CWL|EGFF|Cardiff||GB|51.3967|-3.3433|220|301|0
CXI|PLCH|Cassidy|Kiritimati|KI|1.9863|-157.35|5|353|0
CXR|VVCR|Cam Ranh International Airport / Cam Ranh|Nha Trang/nha Trang aiurportCam Ranh|VN|11.9982|109.219|40|204|0
CZL|DABC|Mohamed Boudiaf|Constantine|DZ|36.276|6.6204|2265|4|0
CZM|MMCZ|Cozumel||MX|20.5149|-86.9285|15|83|0
DAC|VGHS|Hazrat Shahjalal|Dhaka|BD|23.8433|90.3978|30|199|0
DAD|VVDN|Da Nang||VN|16.0439|108.199|33|204|0
DAL|KDAL|Dallas Love Field||US|32.8448|-96.8477|487|87|0
DAM|OSDI|Damascus||SY|33.4115|36.5156|2020|198|0
DAR|HTDA|Julius Nyerere|Dar es Salaam|TZ|-6.8735|39.2073|182|17|0
DAT|ZBDT|Datong Yungang||CN|40.0614|113.481|3442|241|0
DBB|HEAL|El Alamein||EG|30.9243|28.4616|154|13|0
DBV|LDDU|Dubrovnik Ruđer Bošković||HR|42.5622|18.2655|527|328|0
DCA|KDCA|Ronald Reagan Washington||US|38.8521|-77.0377|15|139|0
DEB|LHDC|Debrecen||HU|47.4895|21.6163|359|286|0
DEL|VIDP|Indira Gandhi|New Delhi|IN|28.5556|77.0952|777|216|0
DEN|KDEN|Denver||US|39.86|-104.674|5431|95|0
DFW|KDFW|Dallas Fort Worth|Dallas-Fort Worth|US|32.8968|-97.038|607|87|0
DHA|OEDR|King Abdulaziz|Dhahran|SA|26.2654|50.152|84|237|0
DIA|OTBD|Doha||QA|25.2594|51.5655|35|234|0
DIL|WPDL|Presidente Nicolau Lobato|Dili|TL|-8.5466|125.525|154|200|0
DIR|HADR|Aba Tenna Dejazmach Yilma|Dire Dawa|ET|9.6235|41.855|3827|3|0
DJE|DTTJ|Djerba Zarzis|Mellita|TN|33.8737|10.7773|19|50|0
DJG|DAAJ|Tiska Djanet||DZ|24.2854|9.4637|3176|4|0
DJJ|WAJJ|Dortheys Hiyo Eluay|Sentani|ID|-2.5796|140.52|289|209|0
DKR|GOOY|Léopold Sédar Senghor|Dakar|SN|14.7423|-17.4792|85|16|0
DLA|FKKD|Douala||CM|4.0061|9.7195|33|19|0
DLC|ZYTL|Dalian Zhoushuizi|Dalian (Ganjingzi)|CN|38.9657|121.538|107|241|0
DLM|LTBS|Dalaman||TR|36.7131|28.7925|20|294|0
DMB|UADD|Taraz||KZ|42.8536|71.3036|2184|180|0
DME|UUDD|Domodedovo|Moscow|RU|55.4088|37.9063|588|307|0
DMK|VTBD|Don Mueang|Bangkok|TH|13.9126|100.607|9|190|0
DMM|OEDF|King Fahd|Ad Dammam|SA|26.4691|49.7982|72|237|0
DNA|RODN|Kadena|Okinawa|JP|26.3517|127.769|143|249|0
DNH|ZLDH|Dunhuang Mogao||CN|40.162|94.8128|0|241|0
DOH|OTHH|Hamad|Doha|QA|25.2731|51.6081|13|234|0
DPS|WADD|Denpasar I Gusti Ngurah Rai|Kuta, Badung|ID|-8.7484|115.167|14|223|0
DQM|OODQ|Duqm||OM|19.5019|57.6342|364|225|0
DRP|RPLK|Bicol|Legazpi|PH|13.1119|123.677|319|224|0
DRS|EDDC|Dresden||DE|51.1341|13.7678|755|282|0
DRW|YPDN|Darwin International Airport / RAAF Darwin||AU|-12.415|130.882|103|271|0
DSM|KDSM|Des Moines||US|41.534|-93.6567|958|87|0
DSN|ZBDS|Ordos Ejin Horo||CN|39.4935|109.86|4557|241|0
DSS|GOBD|Blaise Diagne|Dakar|SN|14.6709|-17.0728|290|16|0
DSY|VDDS|Dara Sakor|Ta Noun|KH|10.9142|103.227|60|0|0
DTM|EDLW|Dortmund||DE|51.5183|7.6122|425|282|0
DTW|KDTW|Detroit Metropolitan Wayne||US|42.2138|-83.3538|645|96|0
DUB|EIDW|Dublin||IE|53.4287|-6.2621|242|289|0
DUR|FALE|King Shaka|Durban|ZA|-29.6144|31.1197|295|24|0
DUS|EDDL|Düsseldorf||DE|51.2895|6.7668|147|282|0
DVO|RPMD|Francisco Bangoy|Davao|PH|7.1255|125.646|96|224|0
DWC|OMDW|Al Maktoum|Dubai(Jebel Ali)|AE|24.8962|55.1624|114|201|0
DXB|OMDB|Dubai||AE|25.2498|55.371|62|201|0
DXN|VIND|Noida|Gautam Buddha Nagar|IN|28.1799|77.6118|644|216|0
DYG|ZGDY|Zhangjiajie Hehua|Zhangjiajie (Yongding)|CN|29.1047|110.443|8530|241|0
DYU|UTDD|Dushanbe||TJ|38.5437|68.823|2575|202|0
DZA|FMCZ|Dzaoudzi Pamandzi||YT|-12.8093|45.2818|23|337|0
DZN|UAKD|Zhezkazgan||KZ|47.709|67.7381|1250|180|0
EBB|HUEN|Entebbe||UG|0.0424|32.4435|3782|26|0
EBL|ORER|Erbil|Arbil|IQ|36.236|43.9466|1341|187|0
ECN|LCEN|Ercan|Tymbou (Kirklar)|CY|35.1531|33.5074|404|203|0
EDI|EGPH|Edinburgh|Ingliston, Edinburgh|GB|55.9501|-3.3723|135|301|0
EDL|HKEL|Eldoret||KE|0.4045|35.2389|6941|42|0
EDO|LTFD|Balıkesir Koca Seyit|Edremit|TR|39.5525|27.0102|50|294|0
EES|HEBR|Berenice International Airport / Banas Cape|Berenice Troglodytica|EG|23.9804|35.4603|108|0|0
EHU|ZHEC|Ezhou Huahu||CN|30.3412|115.039|86|241|0
EIN|EHEH|Eindhoven||NL|51.4501|5.3745|74|278|0
EIS|TUPJ|Terrance B. Lettsome|Beef Island|VG|18.4455|-64.5417|15|173|0
ELP|KELP|El Paso||US|31.8099|-106.376|3959|95|0
ELQ|OEGS|Prince Naif bin Abdulaziz|Qassim|SA|26.3028|43.7744|2126|237|0
ELS|FAEL|King Phalo|East London|ZA|-33.0356|27.8259|435|24|0
EMA|EGNX|East Midlands|Nottingham, Leicestershire|GB|52.8311|-1.3281|306|301|0
ENO|SGEN|Teniente Ramon A. Ayub Gonzalez|Encarnación|PY|-27.2275|-55.8376|659|70|0
ENU|DNEN|Akanu Ibiam|Enegu|NG|6.4737|7.5605|466|30|0
ERF|EDDE|Erfurt-Weimar||DE|50.9783|10.9607|1036|282|0
ESB|LTAC|Esenboğa|Ankara|TR|40.1281|32.9951|3125|294|0
ESM|SETN|Carlos Concha Torres|Tachina|EC|0.9785|-79.6266|32|108|0
ETM|LLER|Ramon|Eilat|IL|29.727|35.0141|288|181|0
EUN|GMML|Laayoune Hassan I|El Aaiún|EH|27.1425|-13.2249|207|20|0
EVE|ENEV|Harstad/Narvik|Evenes|NO|68.4913|16.6781|84|308|0
EVN|UDYZ|Zvartnots|Yerevan|AM|40.1489|44.3979|2838|258|0
EWR|KEWR|Newark Liberty||US|40.6894|-74.1705|18|139|0
EZE|SAEZ|Ezeiza International Airport - Ministro Pistarini|Buenos Aires (Ezeiza)|AR|-34.8222|-58.5358|67|57|0
FAE|EKVG|Vágar||FO|62.0633|-7.2758|280|263|0
FAO|LPFR|Faro - Gago Coutinho||PT|37.0159|-7.9709|24|299|0
FAT|KFAT|Fresno Yosemite||US|36.7758|-119.718|336|122|0
FBM|FZQA|Lubumbashi||CD|-11.5915|27.5308|4295|34|0
FCO|LIRF|Rome–Fiumicino Leonardo da Vinci||IT|41.8045|12.252|13|313|0
FDF|TFFF|Martinique Aimé Césaire|Fort-de-France|MQ|14.591|-61.0032|16|127|0
FDH|EDNY|Bodensee Airport Friedrichshafen||DE|47.6713|9.5115|1367|282|0
FEZ|GMFF|Fes Saïss||MA|33.9273|-4.978|1900|14|0
FIH|FZAA|Ndjili|Kinshasa|CD|-4.3857|15.4446|1027|29|0
FJR|OMFJ|Fujairah||AE|25.1084|56.3281|152|201|0
FKB|EDSB|Karlsruhe Baden-Baden|Rheinmünster|DE|48.7794|8.0805|408|282|0
FKI|FZIC|Bangoka|Kisangani|CD|0.4816|25.338|1417|34|0
FLL|KFLL|Fort Lauderdale Hollywood||US|26.0726|-80.1527|9|139|0
FLN|SBFL|Hercílio Luz|Florianópolis|BR|-27.6703|-48.5525|16|159|0
FLR|LIRQ|Florence Airport, Peretola|Firenze (FI)|IT|43.8086|11.2028|142|313|0
FMM|EDJA|Memmingen Allgau||DE|47.9881|10.2382|2077|282|0
FMO|EDDG|Münster Osnabrück|Greven|DE|52.1338|7.6885|160|282|0
FNA|GFLL|Lungi|Freetown (Lungi-Town)|SL|8.6164|-13.1955|84|21|0
FNC|LPMA|Cristiano Ronaldo|Funchal|PT|32.6978|-16.7746|192|264|0
FNJ|ZKPY|Pyongyang Sunan||KP|39.2241|125.67|117|233|0
FOC|ZSFZ|Fuzhou Changle|Fuzhou (Changle)|CN|25.9293|119.672|46|241|0
FOR|SBFZ|Pinto Martins|Fortaleza|BR|-3.7758|-38.5322|83|101|0
FPO|MYGF|Grand Bahama|Freeport|BS|26.558|-78.6956|7|138|0
FRA|EDDF|Frankfurt Main|Frankfurt am Main|DE|50.0267|8.5584|364|282|0
FRW|FBPM|Phillip Gaonwe Matante|Francistown|BW|-21.1592|27.4688|3283|22|0
FSC|LFKF|Figari Sud-Corse||FR|41.5018|9.0971|85|309|0
FSZ|RJNS|Mount Fuji Shizuoka|Makinohara / Shimada|JP|34.795|138.191|433|249|0
FUE|GCFV|Fuerteventura|El Matorral|ES|28.4527|-13.8638|85|261|0
FUK|RJFF|Fukuoka||JP|33.5859|130.451|32|249|0
GAN|VRMG|Gan||MV|-0.693|73.1526|6|335|0
GAU|VEGT|Lokpriya Gopinath Bordoloi|Guwahati|IN|26.1067|91.5852|162|216|0
GBE|FBSK|Sir Seretse Khama|Gaborone|BW|-24.5552|25.9182|3299|22|0
GCM|MWCR|Owen Roberts|George Town|KY|19.2928|-81.3577|8|86|0
GDL|MMGL|Guadalajara||MX|20.5233|-103.31|5016|132|0
GDN|EPGD|Gdańsk Lech Wałęsa||PL|54.3776|18.4662|489|327|0
GEG|KGEG|Spokane||US|47.6199|-117.534|2376|122|0
GEO|SYCJ|Cheddi Jagan|Georgetown|GY|6.4985|-58.2541|95|109|0
GES|RPMR|General Santos||PH|6.0572|125.096|505|224|0
GHV|LRBV|Brașov-Ghimbav|Brașov (Ghimbav)|RO|45.7056|25.5229|1740|285|0
GIB|LXGB|Gibraltar||GI|36.1517|-5.3498|12|290|0
GIG|SBGL|Rio Galeão – Tom Jobim|Rio De Janeiro|BR|-22.81|-43.2506|28|159|0
GJL|DAAV|Jijel Ferhat Abbas|Tahir|DZ|36.7941|5.8737|36|4|0
GLA|EGPF|Glasgow||GB|55.8719|-4.4331|26|301|0
GMP|RKSS|Seoul Gimpo||KR|37.5583|126.791|59|240|0
GND|TGPY|Maurice Bishop|Saint George's|GD|12.004|-61.7853|41|105|0
GNJ|UBBG|Ganja||AZ|40.7387|46.3204|1083|189|0
GNY|LTCS|Şanlıurfa GAP||TR|37.4457|38.8956|2708|294|0
GOA|LIMJ|Genoa Cristoforo Colombo|Genova (GE)|IT|44.412|8.8407|13|313|0
GOH|BGGH|Nuuk||GL|64.1911|-51.6791|283|142|0
GOI|VOGO|Goa Dabolim|Vasco da Gama|IN|15.3801|73.8333|150|216|0
GOJ|UWGG|Nizhny Novgorod / Strigino||RU|56.2274|43.7852|256|307|0
GOM|FZNA|Goma||CD|-1.6668|29.238|5089|28|0
GOT|ESGG|Göteborg Landvetter||SE|57.6628|12.2798|506|320|0
GOU|FKKR|Garoua||CM|9.3348|13.3721|794|19|0
GOX|VOGA|Manohar|Mopa|IN|15.7443|73.8606|552|216|0
GRJ|FAGG|George||ZA|-34.0056|22.3789|648|24|0
GRO|LEGE|Girona-Costa Brava||ES|41.9046|2.7618|468|303|0
GRQ|EHGG|Groningen Airport Eelde||NL|53.1191|6.5777|17|278|0
GRR|KGRR|Gerald R. Ford|Grand Rapids|US|42.8808|-85.5228|794|96|0
GRU|SBGR|São Paulo/Guarulhos–Governor André Franco Montoro||BR|-23.4313|-46.47|2461|159|0
GRV|URMG|Akhmat Kadyrov Grozny||RU|43.3881|45.6998|548|307|0
GRZ|LOWG|Graz|Feldkirchen bei Graz|AT|46.9911|15.4396|1115|324|0
GSM|OIKQ|Qeshm|Qeshm(Dayrestan)|IR|26.7546|55.9024|45|247|0
GSO|KGSO|Piedmont Triad|Greensboro|US|36.0994|-79.9373|925|139|0
GSV|UWSG|Gagarin|Saratov|RU|51.7128|46.1711|103|316|0
GUA|MGGT|La Aurora|Guatemala City|GT|14.5829|-90.5275|4952|107|0
GUM|PGUM|Antonio B. Won Pat|Hagåtña|GU|13.485|144.797|298|351|0
GUW|UATG|Atyrau||KZ|47.1213|51.8203|-72|186|0
GVA|LSGG|Geneva||CH|46.2381|6.109|1411|309|0
GWD|OPGW|New Gwadar|Gurandani|PK|25.2967|62.4988|61|213|0
GXF|OYSY|Seiyun Hadhramaut||YE|15.9659|48.7881|2097|179|0
GYD|UBBB|Heydar Aliyev|Baku|AZ|40.4728|50.0509|10|189|0
GYE|SEGU|José Joaquín de Olmedo|Guayaquil|EC|-2.1574|-79.8836|19|108|0
GYN|SBGO|Santa Genoveva|Goiânia|BR|-16.632|-49.2207|2450|159|0
GZT|LTAJ|Gaziantep Oğuzeli||TR|36.9472|37.4787|2315|294|0
HAH|FMCH|Prince Said Ibrahim|Moroni|KM|-11.5337|43.2719|93|333|0
HAJ|EDDV|Hannover||DE|52.4611|9.6851|183|282|0
HAK|ZJHK|Haikou Meilan|Haikou (Meilan)|CN|19.9349|110.459|75|241|0
HAM|EDDH|Hamburg Helmut Schmidt||DE|53.6304|9.9882|53|282|0
HAN|VVNB|Noi Bai|Hanoi (Soc Son)|VN|21.2212|105.807|39|190|0
HAQ|VRMH|Hanimaadhoo|Haa Dhaalu Atoll|MV|6.7432|73.1671|4|335|0
HAS|OEHL|Hail||SA|27.4379|41.6863|3331|237|0
HAV|MUHA|José Martí|Havana|CU|22.9892|-82.4091|210|111|0
HBA|YMHB|Hobart|Hobart (Cambridge)|AU|-42.837|147.513|13|272|0
HBE|HEAX|Alexandria||EG|30.9325|29.6964|171|13|0
HDY|VTSS|Hat Yai||TH|6.9332|100.393|90|190|0
HEA|OAHR|Herat - Khwaja Abdullah Ansari|Guzara|AF|34.21|62.2283|3206|211|0
HEL|EFHK|Helsinki Vantaa|Helsinki (Vantaa)|FI|60.3184|24.9633|179|292|0
HER|LGIR|Heraklion International Nikos Kazantzakis||GR|35.3397|25.1803|115|280|0
HET|ZBHH|Hohhot Baita||CN|40.8497|111.825|3556|241|0
HFE|ZSOF|Hefei Xinqiao||CN|31.9878|116.977|207|241|0
HGA|HCMH|Egal|Hargeisa|SO|9.5141|44.0835|4471|40|0
HGH|ZSHC|Hangzhou Xiaoshan||CN|30.2361|120.429|23|241|0
HHN|EDFH|Frankfurt-Hahn|Frankfurt am Main (Lautzenhausen)|DE|49.9464|7.2617|1649|282|0
HIA|ZSSH|Huai'an Lianshui||CN|33.7927|119.127|28|241|0
HIJ|RJOA|Hiroshima||JP|34.4361|132.919|1088|249|0
HIR|AGGH|Honiara||SB|-9.428|160.055|28|350|0
HKD|RJCH|Hakodate||JP|41.77|140.822|151|249|0
HKG|VHHH|Hong Kong||HK|22.3118|113.915|28|205|0
HKT|VTSP|Phuket||TH|8.1133|98.3174|82|190|0
HLA|FALA|Lanseria|Johannesburg|ZA|-25.939|27.9266|4517|24|0
HLD|ZBLA|Hulunbuir Hailar||CN|49.2086|119.822|2169|241|0
HLP|WIHH|Halim Perdanakusuma|Jakarta|ID|-6.267|106.89|84|208|0
HMB|HESG|Suhaj||EG|26.3425|31.743|322|13|0
HMO|MMHO|General Ignacio L. Pesqueira|Hermosillo|MX|29.0928|-111.053|627|112|0
HND|RJTT|Tokyo Haneda||JP|35.5497|139.787|35|249|0
HNL|PHNL|Daniel K. Inouye|Honolulu, Oahu|US|21.3184|-157.926|13|352|0
HOF|OEAH|Al-Ahsa|Hofuf|SA|25.2853|49.4852|588|237|0
HOG|MUHG|Frank Pais|Holguin|CU|20.7851|-76.3155|361|111|0
HOU|KHOU|William P. Hobby|Houston|US|29.6453|-95.2768|46|87|0
HPH|VVCI|Cat Bi|Haiphong (Hai An)|VN|20.8174|106.724|6|190|0
HRB|ZYHB|Harbin Taiping||CN|45.6234|126.25|457|241|0
HRE|FVRG|Robert Gabriel Mugabe|Harare|ZW|-17.9318|31.0928|4887|23|0
HRG|HEGN|Hurghada||EG|27.1768|33.7967|32|13|0
HSA|UAIT|Hazrat Sultan|Turkıstan|KZ|43.3111|68.5504|951|180|0
HSG|RJFS|Kyushu Saga||JP|33.1497|130.302|6|249|0
HSN|ZSZS|Zhoushan Putuoshan||CN|29.9339|122.362|6|241|0
HSR|VAHS|Rajkot||IN|22.3788|71.0394|647|216|0
HSS|VIHR|Maharaja Agrasen|Hisar|IN|29.1861|75.7414|700|216|0
HTA|UIAA|Chita-Kadala||RU|52.0248|113.306|2272|195|0
HUN|RCYU|Hualien Chiashan|Hualien City|TW|24.0232|121.618|52|244|0
HUX|MMBT|Bahías de Huatulco||MX|15.7754|-96.2605|464|132|0
HWR|VIHX|Halwara||IN|30.7485|75.6298|790|216|0
HYD|VOHS|Rajiv Gandhi|Hyderabad|IN|17.2313|78.4299|2024|216|0
IAD|KIAD|Washington Dulles||US|38.9445|-77.4558|312|139|0
IAH|KIAH|George Bush|Houston|US|29.9844|-95.3414|97|87|0
IAR|UUDL|Golden Ring Yaroslavl|Tunoshna|RU|57.5607|40.1574|287|307|0
IAS|LRIA|Iaşi||RO|47.1796|27.6214|411|285|0
IBR|RJAH|Ibaraki|Omitama|JP|36.1815|140.414|105|249|0
IBZ|LEIB|Ibiza|Ibiza (Eivissa)|ES|38.8729|1.3731|24|303|0
ICN|RKSI|Incheon|Seoul|KR|37.4691|126.451|23|240|0
IDR|VAID|Devi Ahilya Bai Holkar|Indore|IN|22.7214|75.8005|1850|216|0
IFN|OIFM|Isfahan Shahid Beheshti||IR|32.7551|51.8839|5059|247|0
IGU|SBFI|Cataratas|Foz do Iguaçu|BR|-25.5942|-54.4894|786|59|0
IKA|OIIE|Imam Khomeini|Tehran|IR|35.4161|51.1522|3305|247|0
IKT|UIII|Irkutsk||RU|52.2667|104.396|1675|207|0
IKU|UCFL|Issyk-Kul|Tamchy|KG|42.5856|76.7012|5425|193|0
ILO|RPVI|Iloilo|Cabatuan|PH|10.833|122.493|27|224|0
ILR|DNIL|General Tunde Idiagbon|Ilorin/Ogbomosho|NG|8.4402|4.4939|1126|30|0
IMF|VEIM|Bir Tikendrajit|Imphal|IN|24.76|93.8967|2540|216|0
INC|ZLIC|Yinchuan Hedong||CN|38.3228|106.393|3743|241|0
IND|KIND|Indianapolis||US|39.7173|-86.2944|797|113|0
INI|LYNI|Niš Constantine the Great||RS|43.3365|21.8562|648|281|0
INN|LOWI|Innsbruck||AT|47.2602|11.344|1907|324|0
IOM|EGNS|Isle of Man|Castletown|IM|54.0831|-4.6239|52|293|0
IPC|SCIP|Mataveri|Isla De Pascua|CL|-27.1654|-109.421|227|344|0
IPH|WMKI|Sultan Azlan Shah|Ipoh|MY|4.5673|101.092|130|218|0
IQQ|SCDA|Diego Aracena|Iquique|CL|-20.5363|-70.1814|155|157|0
IQT|SPQT|Coronel FAP Francisco Secada Vignetta|Iquitos|PE|-3.7847|-73.3088|306|121|0
ISB|OPIS|Islamabad|Attock|PK|33.549|72.8257|1761|213|0
ISK|VAOZ|Nashik||IN|20.1191|73.9129|1900|216|0
ISL|LTBA|İstanbul Atatürk|Istanbul(Bakırköy)|TR|40.9719|28.8237|163|294|0
IST|LTFM|İstanbul|Istanbul|TR|41.2749|28.7321|325|294|0
ITM|RJOO|Osaka Itami||JP|34.7809|135.441|50|249|0
IVL|EFIV|Ivalo||FI|68.6073|27.4053|481|292|0
IXB|VEBD|Bagdogra|Siliguri|IN|26.6812|88.3286|412|216|0
IXC|VICG|Shaheed Bhagat Singh|Chandigarh|IN|30.6735|76.7885|1012|216|0
IXE|VOML|Mangaluru||IN|12.9547|74.8868|337|216|0
IXZ|VOPB|Veer Savarkar International Airport / INS Utkrosh|Port Blair|IN|11.6402|92.729|13|216|0
JAF|VCCJ|Jaffna||LK|9.7923|80.0701|33|197|0
JAI|VIJP|Jaipur||IN|26.8242|75.8122|1263|216|0
JAX|KJAX|Jacksonville||US|30.4925|-81.6878|30|139|0
JCL|LKCS|České Budějovice South Bohemian||CZ|48.9482|14.4283|1417|311|0
JED|OEJN|King Abdulaziz|Jeddah|SA|21.6802|39.1574|48|237|0
JFK|KJFK|John F. Kennedy|New York|US|40.6394|-73.7793|13|139|0
JGN|ZLJQ|Jiayuguan||CN|39.8591|98.3393|5112|241|0
JHB|WMKJ|Senai|Johor Bahru|MY|1.6413|103.67|135|218|0
JHG|ZPJH|Xishuangbanna Gasa|Jinghong (Gasa)|CN|21.9746|100.762|1815|241|0
JIB|HDAM|Djibouti-Ambouli|Djibouti City|DJ|11.5473|43.1595|49|18|0
JIJ|HAJJ|Gerad Wilwal|Jijiga|ET|9.3319|42.9118|5954|3|0
JJN|ZSQZ|Quanzhou Jinjiang||CN|24.7959|118.589|39|241|0
JNB|FAOR|O.R. Tambo|Johannesburg|ZA|-26.1401|28.2468|5558|24|0
JPA|SBJP|Presidente Castro Pinto|João Pessoa|BR|-7.1487|-34.9506|217|101|0
JRO|HTKJ|Kilimanjaro|Arusha|TZ|-3.427|37.0735|2932|17|0
JTR|LGSR|Santorini|Santorini Island|GR|36.4|25.4786|127|280|0
JUB|HJJJ|Juba||SS|4.872|31.6011|1513|25|0
JUJ|SASJ|Gobernador Horacio Guzman|San Salvador de Jujuy|AR|-24.3928|-65.0978|3019|60|0
JUL|SPJL|Inca Manco Capac|Juliaca|PE|-15.4677|-70.1565|12552|121|0
KAD|DNKA|Kaduna||NG|10.696|7.3201|2073|30|0
KAN|DNKN|Mallam Aminu Kano||NG|12.0456|8.5236|1562|30|0
KBL|OAKB|Kabul||AF|34.5659|69.2123|5877|211|0
KBV|VTSG|Krabi||TH|8.0956|98.989|82|190|0
KCH|WBGG|Kuching||MY|1.4874|110.353|89|219|0
KCZ|RJOK|Kochi Ryoma|Nankoku|JP|33.5452|133.67|42|249|0
KDH|OAKN|Ahmad Shah Baba|Kandahar|AF|31.5058|65.848|3337|211|0
KDU|OPSD|Skardu||PK|35.3387|75.5386|7316|213|0
KEF|BIKF|Keflavik|Reykjavík|IS|63.985|-22.6056|171|265|0
KEJ|UNEE|Alexei Leonov Kemerovo||RU|55.2701|86.1072|863|227|0
KER|OIKK|Ayatollah Hashemi Rafsanjani|Kerman|IR|30.2713|56.9497|5741|247|0
KGD|UMKK|Khrabrovo|Kaliningrad|RU|54.8916|20.5986|42|296|0
KGF|UAKK|Sary-Arka|Karaganda|KZ|49.6708|73.3344|1765|180|0
KGL|HRYR|Kigali||RW|-1.9686|30.1395|4859|28|0
KGS|LGKO|Kos International Airport Ippokratis|Kos Island|GR|36.7945|27.0911|412|280|0
KHG|ZWSH|Kashgar Laining||CN|39.5423|76.0202|4529|241|0
KHH|RCKH|Kaohsiung|Kaohsiung (Xiaogang)|TW|22.5771|120.35|31|244|0
KHI|OPKC|Jinnah|Karachi|PK|24.9065|67.1608|100|213|0
KHN|ZSCN|Nanchang Changbei||CN|28.8648|115.903|143|241|0
KIH|OIBK|Kish|Kish Island|IR|26.5254|53.9805|101|247|0
KIJ|RJSN|Niigata||JP|37.9542|139.112|29|249|0
KIK|ORKK|Kirkuk||IQ|35.4695|44.3489|1061|187|0
KIM|FAKM|Kimberley||ZA|-28.8054|24.7649|3950|24|0
KIN|MKJP|Norman Manley|Kingston|JM|17.9357|-76.7875|10|116|0
KIS|HKKI|Kisumu||KE|-0.0861|34.7289|3734|42|0
KIX|RJBB|Kansai|Osaka|JP|34.4273|135.244|26|249|0
KJA|UNKL|Krasnoyarsk||RU|56.1757|92.4858|942|217|0
KKJ|RJFR|Kitakyushu||JP|33.8459|131.035|21|249|0
KLO|RPVK|Kalibo||PH|11.6794|122.376|14|224|0
KLU|LOWK|Klagenfurt|Klagenfurt am Wörthersee|AT|46.6425|14.3377|1472|324|0
KLV|LKKV|Karlovy Vary||CZ|50.203|12.915|1989|311|0
KMG|ZPPP|Kunming Changshui||CN|25.1103|102.937|6903|241|0
KMI|RJFM|Miyazaki||JP|31.8772|131.449|20|249|0
KMJ|RJFT|Kumamoto||JP|32.8373|130.855|642|249|0
KMQ|RJNK|Komatsu Airport / JASDF Komatsu|Kanazawa|JP|36.3934|136.407|36|249|0
KMS|DGSI|Prempeh I|Kumasi|GH|6.7146|-1.5908|942|2|0
KNO|WIMM|Kualanamu|Beringin|ID|3.6378|98.8706|23|208|0
KOA|PHKO|Ellison Onizuka Kona International Airport at Keāhole|Kailua-Kona|US|19.7388|-156.046|47|352|0
KOJ|RJFK|Kagoshima||JP|31.8034|130.719|906|249|0
KOS|VDSV|Sihanouk|Preah Sihanouk|KH|10.5706|103.632|33|231|0
KOV|UACK|Kokshetau||KZ|53.3291|69.5946|900|180|0
KQT|UTDT|Bokhtar||TJ|37.8663|68.8645|1473|202|0
KRK|EPKK|Kraków John Paul II|Balice|PL|50.0777|19.7848|791|327|0
KRN|ESNQ|Kiruna||SE|67.822|20.3368|1508|320|0
KRR|URKK|Krasnodar Pashkovsky||RU|45.0345|39.1742|118|307|0
KRS|ENCN|Kristiansand|Kristiansand(Kjevik)|NO|58.2042|8.0854|57|308|0
KRT|HSSK|Khartoum||SD|15.5895|32.5532|1265|27|0
KSA|PTSA|Kosrae|Okat|FM|5.357|162.958|11|354|0
KSF|EDVK|Kassel|Calden|DE|51.4184|9.3916|820|282|0
KSN|UAUU|Kostanay||KZ|53.2069|63.5503|595|235|0
KTI|VDTI|Techo|Phnom Penh (Boeng Khyang)|KH|11.36|104.921|20|231|0
KTM|VNKT|Tribhuvan|Kathmandu|NP|27.6966|85.3591|4390|214|0
KTT|EFKT|Kittilä||FI|67.701|24.8468|644|292|0
KTW|EPKT|Katowice Wojciech Korfanty||PL|50.476|19.0807|995|327|0
KUF|UWWW|Kurumoch|Samara|RU|53.5049|50.1643|477|314|0
KUL|WMKK|Kuala Lumpur|Sepang|MY|2.7456|101.71|69|218|0
KUN|EYKA|Kaunas||LT|54.964|24.0858|256|325|0
KUO|EFKU|Kuopio|Kuopio / Siilinjärvi|FI|63.0071|27.7978|323|292|0
KUT|UGKO|David the Builder Kutaisi|Kopitnari|GE|42.1774|42.4854|223|246|0
KVA|LGKV|Kavala Alexander the Great||GR|40.9133|24.6192|18|280|0
KWE|ZUGY|Guiyang Longdongbao|Guiyang (Nanming)|CN|26.5418|106.804|3736|241|0
KWI|OKKK|Kuwait|Kuwait City|KW|29.2245|47.9698|206|220|0
KWL|ZGKL|Guilin Liangjiang|Guilin (Lingui)|CN|25.2198|110.04|570|241|0
KYA|LTAN|Konya||TR|37.979|32.5619|3392|294|0
KZN|UWKD|Kazan||RU|55.6062|49.2787|411|307|0
KZO|UAOO|Korkyt Ata|Kyzylorda|KZ|44.7069|65.5925|433|236|0
LAD|FNLU|Quatro de Fevereiro|Luanda|AO|-8.8584|13.2312|243|33|0
LAE|AYNZ|Nadzab Tomodachi|Lae|PG|-6.568|146.726|239|365|0
LAO|RPLI|Laoag|Laoag City|PH|18.1751|120.531|25|224|0
LAQ|HLLQ|Al Abraq|Al Albraq|LY|32.789|21.9549|2157|49|0
LAS|KLAS|Harry Reid|Las Vegas|US|36.0834|-115.152|2181|122|0
LAX|KLAX|Los Angeles||US|33.9425|-118.408|125|122|0
LBA|EGNM|Leeds Bradford|Leeds, West Yorkshire|GB|53.8659|-1.6606|681|301|0
LBD|UTDL|Khujand||TJ|40.2154|69.6947|1450|202|0
LBG|LFPB|Paris-Le Bourget||FR|48.9623|2.4365|218|309|0
LBV|FOOL|Libreville Leon M'ba||GA|0.459|9.4121|39|31|0
LCA|LCLK|Larnaca||CY|34.8751|33.6249|8|226|0
LCJ|EPLL|Łódź Władysław Reymont||PL|51.7219|19.3981|604|327|0
LED|ULLI|Pulkovo|St. Petersburg|RU|59.8003|30.2625|78|307|0
LEJ|EDDP|Leipzig/Halle|Schkeuditz|DE|51.4207|12.2327|465|282|0
LFW|DXXX|Lomé–Tokoin||TG|6.1656|1.2545|72|32|0
LGA|KLGA|LaGuardia|New York|US|40.7772|-73.8726|21|139|0
LGB|KLGB|Long Beach||US|33.8165|-118.15|60|122|0
LGK|WMKL|Langkawi||MY|6.3297|99.7287|29|218|0
LGW|EGKK|London Gatwick||GB|51.1487|-0.1857|202|301|0
LHE|OPLA|Allama Iqbal|Lahore|PK|31.5216|74.4036|712|213|0
LHR|EGLL|London Heathrow||GB|51.4707|-0.4599|83|301|0
LHW|ZLLL|Lanzhou Zhongchuan|Lanzhou (Yongdeng)|CN|36.5152|103.62|6388|241|0
LIH|PHLI|Lihue|Lihue, Kauai|US|21.9744|-159.337|153|352|0
LIL|LFQQ|Lille|Lesquin|FR|50.5666|3.1024|157|309|0
LIM|SPJC|Jorge Chávez|Lima|PE|-12.0219|-77.1143|113|121|0
LIN|LIML|Milano Linate|Segrate (MI)|IT|45.4451|9.2767|353|313|0
LIR|MRLB|Daniel Oduber Quirós|Liberia|CR|10.5933|-85.5444|270|90|0
LIS|LPPT|Lisbon Humberto Delgado||PT|38.7813|-9.1359|374|299|0
LJG|ZPLJ|Lijiang Sanyi||CN|26.6775|100.245|7359|241|0
LJU|LJLJ|Ljubljana Jože Pučnik|Zgornji Brnik|SI|46.2237|14.4576|1273|300|0
LKO|VILK|Chaudhary Charan Singh|Lucknow|IN|26.7606|80.8893|410|216|0
LLA|ESPA|Luleå||SE|65.5438|22.122|65|320|0
LLW|FWKI|Kamuzu|Lumbadzi|MW|-13.7894|33.781|4035|10|0
LNZ|LOWL|Linz-Hörsching||AT|48.2354|14.1881|980|324|0
LOP|WADL|Lombok|Mataram (Pujut, Lombok Tengah)|ID|-8.76|116.278|319|223|0
LOS|DNMM|Murtala Muhammed|Lagos|NG|6.5774|3.3212|135|30|0
LPA|GCLP|Gran Canaria|Gran Canaria Island|ES|27.9319|-15.3866|78|261|0
LPB|SLLP|El Alto|La Paz / El Alto|BO|-16.5103|-68.1894|13355|120|0
LPI|ESSL|Linköping City||SE|58.4049|15.6845|172|320|0
LPL|EGGP|Liverpool John Lennon||GB|53.3349|-2.8496|80|301|0
LPP|EFLP|Lappeenranta||FI|61.0446|28.1447|349|292|0
LPQ|VLLB|Luang Phabang||LA|19.9043|102.167|955|253|0
LPX|EVLA|Liepāja||LV|56.5175|21.0969|16|312|0
LRL|DXNG|Niamtougou||TG|9.7667|1.0909|1515|32|0
LRM|MDLR|Casa De Campo|La Romana|DO|18.4522|-68.9111|213|158|0
LTH|VVLT|Long Thanh International Airport (Under Construction)|Ho Chi Minh City (Long Thanh)|VN|10.7728|107.041|249|0|0
LTN|EGGW|London Luton|Luton, Luton|GB|51.8747|-0.3683|526|301|0
LTO|MMLT|Loreto||MX|25.9895|-111.348|34|129|0
LUN|FLKK|Kenneth Kaunda|Lusaka|ZM|-15.3308|28.4527|3779|35|0
LUX|ELLX|Luxembourg-Findel||LU|49.6268|6.2121|1234|302|0
LUZ|EPLB|Lublin||PL|51.2402|22.7135|633|327|0
LVI|FLHN|Harry Mwanga Nkumbula|Livingstone|ZM|-17.8215|25.8196|3302|35|0
LWN|UDSG|Shirak|Gyumri|AM|40.7504|43.8593|5000|258|0
LWO|UKLL|Lviv||UA|49.8125|23.9561|1071|298|0
LXA|ZULS|Lhasa Gonggar|Shannan (Gonggar)|CN|29.298|90.912|11713|241|0
LXR|HELX|Luxor||EG|25.671|32.7064|276|13|0
LYA|ZHLY|Luoyang Beijiao|Luoyang (Laocheng)|CN|34.7411|112.388|840|241|0
LYG|ZSLG|Lianyungang Huaguoshan||CN|34.4141|119.179|0|241|0
LYP|OPFA|Faisalabad||PK|31.3649|72.9953|591|213|0
LYS|LFLL|Lyon Saint-Exupéry|Colombier-Saugnieu, Rhône|FR|45.726|5.0901|821|309|0
MAA|VOMM|Chennai||IN|12.99|80.1693|52|216|0
MAD|LEMD|Adolfo Suárez Madrid–Barajas||ES|40.4934|-3.5722|1998|303|0
MAH|LEMH|Menorca|Mahón (Maó)|ES|39.8626|4.2187|302|303|0
MAJ|PKMJ|Marshall Islands|Majuro Atoll|MH|7.0651|171.272|6|356|0
MAN|EGCC|Manchester|Manchester, Greater Manchester|GB|53.3494|-2.2795|257|301|0
MAO|SBEG|Eduardo Gomes|Manaus|BR|-3.0386|-60.0497|264|126|0
MAR|SVMC|La Chinita|Maracaibo|VE|10.5575|-71.7293|239|84|0
MBA|HKMO|Moi|Mombasa|KE|-4.0348|39.5942|200|42|0
MBJ|MKJS|Sangster|Montego Bay|JM|18.5034|-77.9132|4|116|0
MCI|KMCI|Kansas City||US|39.3017|-94.7139|1026|87|0
MCO|KMCO|Orlando||US|28.4294|-81.309|96|139|0
MCT|OOMS|Muscat|Muscat/Seeb|OM|23.6002|58.2853|48|225|0
MCX|URML|Makhachkala Uytash||RU|42.8168|47.6523|12|307|0
MCY|YBSU|Sunshine Coast|Maroochydore|AU|-26.5933|153.083|15|269|0
MCZ|SBMO|Zumbi dos Palmares|Maceió|BR|-9.5126|-35.7918|387|124|0
MDC|WAMM|Sam Ratulangi|Manado|ID|1.5486|124.926|264|223|0
MDE|SKRG|Jose Maria Córdova|Medellín|CO|6.1645|-75.4231|6955|79|0
MDL|VYMD|Mandalay||MM|21.7022|95.9779|300|256|0
MDW|KMDW|Chicago Midway||US|41.786|-87.7524|620|87|0
MDZ|SAME|Governor Francisco Gabrielli|Mendoza|AR|-32.8317|-68.7929|2310|62|0
MED|OEMA|Prince Mohammad Bin Abdulaziz|Medina|SA|24.5534|39.7051|2151|237|0
MEL|YMML|Melbourne||AU|-37.6707|144.838|434|275|0
MEM|KMEM|Frederick W. Smith|Memphis|US|35.0438|-89.9763|341|87|0
MEX|MMMX|Mexico City Benito Juárez||MX|19.4358|-99.0703|7316|132|0
MFM|VMMC|Macau|Nossa Senhora do Carmo|MO|22.1496|113.592|20|221|0
MFU|FLMF|Mfuwe||ZM|-13.2589|31.9366|1853|35|0
MGA|MNMG|Augusto C. Sandino (Managua)||NI|12.1415|-86.1682|194|125|0
MGQ|HCMM|Aden Adde|Mogadishu|SO|2.0144|45.3047|29|40|0
MHD|OIMM|Mashhad||IR|36.2348|59.6429|3263|247|0
MIA|KMIA|Miami||US|25.796|-80.2898|8|139|0
MID|MMMD|Manuel Crescencio Rejón|Mérida|MX|20.9305|-89.6455|38|131|0
MIU|DNMA|Maiduguri||NG|11.8542|13.0807|1099|30|0
MJI|HLLM|Mitiga|Tripoli|LY|32.8918|13.2879|36|49|0
MJN|FMNM|Amborovy|Mahajanga|MG|-15.6668|46.3512|87|330|0
MKE|KMKE|General Mitchell|Milwaukee|US|42.9472|-87.8966|723|87|0
MLA|LMML|Malta|Valletta|MT|35.8459|14.4915|300|304|0
MLE|VRMM|Velana|Malé|MV|4.1918|73.5291|6|335|0
MLM|MMMM|General Francisco J. Mujica|Morelia|MX|19.8499|-101.025|6033|132|0
MMK|ULMM|Emperor Nicholas II Murmansk||RU|68.7817|32.7508|266|307|0
MMX|ESMS|Malmö Sturup||SE|55.5356|13.3763|236|320|0
MNI|TRPG|John A. Osborne|Gerald's Park|MS|16.7918|-62.1932|550|137|0
MNL|RPLL|Ninoy Aquino|Manila (Pasay)|PH|14.5086|121.02|75|224|0
MPL|LFMT|Montpellier-Méditerranée|Montpellier/Méditerranée|FR|43.5762|3.963|17|309|0
MPM|FQMA|Maputo||MZ|-25.9208|32.5726|145|37|0
MPN|EGYP|Mount Pleasant Airport / RAF Mount Pleasant||FK|-51.8226|-58.4458|244|267|0
MQF|USCM|Magnitogorsk||RU|53.392|58.7552|1430|257|0
MQP|FAKN|Kruger Mpumalanga|Mbombela|ZA|-25.3833|31.1053|2829|24|0
MRS|LFML|Marseille Provence|Marignane, Bouches-du-Rhône|FR|43.4381|5.2125|74|309|0
MRU|FIMP|Sir Seewoosagur Ramgoolam|Plaine Magnien|MU|-20.4302|57.6836|186|336|0
MRV|URMM|Mineralnye Vody|Mineralnyye Vody|RU|44.2251|43.0819|1054|307|0
MSP|KMSP|Minneapolis–Saint Paul International Airport / Wold–Chamberlain Field||US|44.8801|-93.2217|841|87|0
MSQ|UMMS|Minsk||BY|53.8881|28.04|670|306|0
MST|EHBK|Maastricht Aachen||NL|50.9111|5.7694|375|278|0
MSU|FXMM|Moshoeshoe I|Maseru(Mazenod)|LS|-29.4563|27.5545|5348|38|0
MSY|KMSY|Louis Armstrong New Orleans||US|29.9934|-90.2647|4|87|0
MTY|MMMY|Monterrey||MX|25.7785|-100.107|1278|135|0
MUB|FBMN|Maun||BW|-19.9705|23.4314|3093|22|0
MUC|EDDM|Munich||DE|48.3538|11.7861|1487|282|0
MUH|HEMM|Mersa Matruh|Marsa Matruh|EG|31.3243|27.2223|75|13|0
MUX|OPMT|Multan||PK|30.2032|71.4191|403|213|0
MVD|SUMU|Carrasco General Cesáreo L. Berisso|Ciudad de la Costa|UY|-34.8356|-56.0265|105|136|0
MWX|RKJB|Muan|Muan (Piseo-ri)|KR|34.9914|126.383|35|240|0
MWZ|HTMW|Mwanza||TZ|-2.4466|32.936|3763|17|0
MXP|LIMC|Milan Malpensa|Ferno (VA)|IT|45.6306|8.7281|768|313|0
MYJ|RJOM|Matsuyama||JP|33.8269|132.7|25|249|0
MYR|KMYR|Myrtle Beach||US|33.6797|-78.9283|25|139|0
MZG|RCQC|Penghu Magong|Huxi|TW|23.5687|119.628|103|244|0
MZR|OAMS|Mazar-i-Sharif||AF|36.7041|67.2105|1284|211|0
MZT|MMMZ|General Rafael Buelna|Mazatlàn|MX|23.1628|-106.264|38|129|0
NAG|VANP|Dr. Babasaheb Ambedkar|Nagpur|IN|21.0922|79.0472|1033|216|0
NAJ|UBBN|Nakhchivan||AZ|39.1888|45.4584|2863|189|0
NAN|NFFN|Nadi||FJ|-17.7618|177.438|59|346|0
NAP|LIRN|Naples|Napoli|IT|40.886|14.2908|294|313|0
NAS|MYNN|Lynden Pindling|Nassau|BS|25.039|-77.4662|16|138|0
NAT|SBSG|Rio Grande do Norte/São Gonçalo do Amarante–Governador Aluízio Alves|Natal|BR|-5.7698|-35.3666|273|101|0
NAV|LTAZ|Nevşehir Kapadokya||TR|38.7719|34.5345|3100|294|0
NBJ|FNBJ|Dr. Antonio Agostinho Neto|Luanda (Ícolo e Bengo)|AO|-9.0507|13.4991|550|33|0
NBO|HKJK|Jomo Kenyatta|Nairobi|KE|-1.3189|36.9282|5330|42|0
NCE|LFMN|Nice-Côte d'Azur|Nice, Alpes-Maritimes|FR|43.6584|7.2159|12|309|0
NCL|EGNT|Newcastle|Newcastle upon Tyne, Tyne and Wear|GB|55.038|-1.6896|266|301|0
NCU|UZNN|Nukus||UZ|42.4884|59.6233|246|239|0
NDB|GQPP|Nouadhibou||MR|20.9324|-17.0302|24|20|0
NDG|ZYQQ|Qiqihar Sanjiazi||CN|47.23|123.914|477|241|0
NDJ|FTTJ|N'Djamena||TD|12.1337|15.034|968|43|0
NDR|GMMW|Nador Al Aaroui||MA|34.9888|-3.0282|574|14|0
NGB|ZSNB|Ningbo Lishe||CN|29.8267|121.462|13|241|0
NGO|RJGG|Chubu Centrair|Tokoname|JP|34.8584|136.805|15|249|0
NGS|RJFU|Nagasaki||JP|32.9169|129.914|15|249|0
NIM|DRRN|Diori Hamani|Niamey|NE|13.4815|2.1836|732|44|0
NJC|USNN|Nizhnevartovsk||RU|60.9493|76.4836|177|257|0
NJF|ORNI|Al Najaf||IQ|31.9911|44.405|103|187|0
NKC|GQNO|Nouakchott–Oumtounsy||MR|18.31|-15.9697|9|45|0
NKG|ZSNJ|Nanjing Lukou||CN|31.735|118.866|49|241|0
NLA|FLSK|Simon Mwansa Kapwepwe|Ndola|ZM|-12.9651|28.5156|4308|35|0
NLU|MMSM|Felipe Ángeles|Mexico City|MX|19.7438|-99.0151|7369|132|0
NMA|UZFN|Namangan||UZ|40.9846|71.5578|1555|245|0
NMI|VANM|Navi Mumbai||IN|18.9846|73.0653|184|216|0
NNG|ZGNN|Nanning Wuxu|Nanning (Jiangnan)|CN|22.5981|108.182|421|241|0
NOC|EIKN|Ireland West Airport Knock|Charlestown|IE|53.9104|-8.817|665|289|0
NOS|FMNN|Nosy Be||MG|-13.3121|48.3148|36|330|0
NOU|NWWW|La Tontouta|Nouméa (La Tontouta)|NC|-22.0146|166.213|52|361|0
NQN|SAZN|Presidente Perón|Neuquén|AR|-38.949|-68.1557|895|64|0
NQZ|UACC|Nursultan Nazarbayev|Astana|KZ|51.027|71.4671|1165|180|0
NRN|EDLV|Weeze (Niederrhein)||DE|51.6014|6.1412|106|278|0
NRT|RJAA|Narita||JP|35.7686|140.389|141|249|0
NSI|FKYS|Yaoundé Nsimalen||CM|3.7226|11.5533|2278|19|0
NSK|UOOO|Alykel|Norilsk|RU|69.308|87.3259|574|217|0
NTE|LFRS|Nantes Atlantique||FR|47.1532|-1.6107|90|309|0
NTL|YWLM|Newcastle|Williamtown|AU|-32.7961|151.835|31|277|0
NUE|EDDN|Nuremberg||DE|49.4987|11.0781|1046|282|0
NUM|OENN|Neom Bay|Sharma|SA|27.9243|35.2936|29|237|0
NVT|SBNF|Ministro Victor Konder|Navegantes|BR|-26.8794|-48.651|18|159|0
NYO|ESKN|Stockholm Skavsta|Nyköping|SE|58.7897|16.9115|140|320|0
NYT|VYNT|Nay Pyi Taw|Naypyitaw|MM|19.6235|96.201|302|256|0
OAK|KOAK|Oakland San Francisco Bay||US|37.7201|-122.221|9|122|0
OAX|MMOX|Xoxocotlán|Oaxaca|MX|16.9988|-96.7261|4989|132|0
OCS|FGCO|Corisco|Corisco Island|GQ|0.9109|9.3303|55|0|0
ODE|EKOD|Odense Hans Christian Andersen||DK|55.4753|10.3272|56|288|0
ODS|UKOO|Odesa||UA|46.4272|30.6726|172|298|0
OEC|WPOC|Oecusse Route of the Sandalwood|Oecussi-Ambeno|TL|-9.1984|124.338|0|200|0
OGG|PHOG|Kahului||US|20.8963|-156.432|54|352|0
OHD|LWOH|Ohrid St. Paul the Apostle||MK|41.18|20.7423|2313|318|0
OHS|OOSH|Suhar||OM|24.386|56.6254|20|225|0
OKA|ROAH|Naha||JP|26.1924|127.64|12|249|0
OKC|KOKC|OKC Will Rogers World|Oklahoma City|US|35.3934|-97.5982|1295|87|0
OKJ|RJOB|Okayama Momotaro||JP|34.7569|133.855|806|249|0
OLB|LIEO|Olbia Costa Smeralda|Olbia (SS)|IT|40.899|9.5185|37|313|0
OMA|KOMA|Eppley|Omaha|US|41.3032|-95.8941|984|87|0
OMO|LQMO|Mostar||BA|43.2825|17.8461|156|315|0
OMR|LROD|Oradea||RO|47.0253|21.9025|465|285|0
OMS|UNOO|Omsk Central||RU|54.9631|73.3124|311|229|0
ONT|KONT|Ontario||US|34.056|-117.601|944|122|0
OOL|YBCG|Gold Coast||AU|-28.166|153.507|21|269|0
OPO|LPPR|Francisco de Sá Carneiro|Porto|PT|41.2481|-8.6814|228|299|0
ORD|KORD|Chicago O'Hare||US|41.9786|-87.9048|680|87|0
ORF|KORF|Norfolk||US|36.8953|-76.201|26|139|0
ORK|EICK|Cork||IE|51.8413|-8.4911|502|289|0
ORN|DAOO|Oran Es-Sénia (Ahmed Ben Bella)||DZ|35.6206|-0.6225|295|4|0
ORU|SLOR|Juan Mendoza|Oruro|BO|-17.9562|-67.0758|12152|120|0
ORY|LFPO|Paris-Orly|Paris (Orly, Val-de-Marne)|FR|48.7295|2.359|291|309|0
OSL|ENGM|Oslo-Gardermoen|Oslo (Gardermoen)|NO|60.1939|11.1004|681|308|0
OSM|ORBM|Mosul||IQ|36.3058|43.1474|719|187|0
OSR|LKMT|Leoš Janáček Airport Ostrava|Mošnov|CZ|49.6963|18.1111|844|311|0
OSS|UCFO|Osh||KG|40.609|72.7933|2927|193|0
OST|EBOS|Ostend-Bruges|Oostende|BE|51.1998|2.8747|13|284|0
OTP|LROP|Bucharest Henri Coandă|Otopeni|RO|44.5718|26.1033|314|285|0
OUA|DFFD|Ouagadougou Thomas Sankara||BF|12.3532|-1.5124|1037|46|0
OUD|GMFO|Oujda Angads|Ahl Angad|MA|34.7896|-1.926|1535|14|0
OUL|EFOU|Oulu|Oulu / Oulunsalo|FI|64.9301|25.3546|47|292|0
OVB|UNNT|Novosibirsk Tolmachevo||RU|55.0198|82.6187|365|228|0
OVD|LEAS|Asturias|Ranón|ES|43.5636|-6.0346|416|303|0
OXB|GGOV|Osvaldo Vieira|Bissau|GW|11.8943|-15.6536|129|9|0
OZG|GMAZ|Zagora||MA|30.2658|-5.8608|2414|14|0
OZH|UKDE|Zaporizhzhia|Zaporizhia|UA|47.867|35.3147|373|298|0
OZZ|GMMZ|Ouarzazate||MA|30.9391|-6.9094|3782|14|0
PAD|EDLP|Paderborn Lippstadt|Büren|DE|51.6125|8.6175|699|282|0
PAP|MTPP|Toussaint Louverture|Port-au-Prince|HT|18.58|-72.2926|122|146|0
PBC|MMPB|Hermanos Serdán|Puebla|MX|19.1585|-98.3716|7361|132|0
PBH|VQPR|Paro||BT|27.4032|89.4246|7364|248|0
PBI|KDJT|President Donald J. Trump|West Palm Beach|US|26.6832|-80.0956|19|139|0
PBM|SMJP|Johan Adolf Pengel|Paramaribo|SR|5.4528|-55.1878|59|144|0
PCL|SPCL|Cap FAP David Abenzur Rengifo|Pucallpa|PE|-8.3781|-74.5745|513|121|0
PDG|WIEE|Minangkabau|Padang (Katapiang)|ID|-0.786|100.28|18|208|0
PDL|LPPD|João Paulo II|Ponta Delgada|PT|37.7412|-25.6979|259|259|0
PDV|LBPD|Plovdiv||BG|42.0678|24.8508|597|319|0
PDX|KPDX|Portland||US|45.5887|-122.598|31|122|0
PED|LKPD|Pardubice||CZ|50.015|15.7398|741|311|0
PEE|USPP|Perm||RU|57.9145|56.0212|404|257|0
PEG|LIRZ|Perugia San Francesco d'Assisi – Umbria|Perugia (PG)|IT|43.0959|12.5132|697|313|0
PEK|ZBAA|Beijing Capital||CN|40.0773|116.597|116|241|0
PEN|WMKP|Penang||MY|5.2963|100.276|11|218|0
PER|YPPH|Perth||AU|-31.9403|115.967|67|276|0
PEV|LHPP|Pécs-Pogány||HU|45.9889|18.242|651|286|0
PEW|OPPS|Bacha Khan|Peshawar|PK|33.9939|71.5146|1158|213|0
PFO|LCPH|Paphos||CY|34.718|32.4857|41|226|0
PHC|DNPO|Port Harcourt||NG|5.0155|6.9496|87|30|0
PHE|YPPD|Port Hedland||AU|-20.3828|118.63|33|276|0
PHH|VNPR|Pokhara||NP|28.1838|84.0147|2595|214|0
PHL|KPHL|Philadelphia||US|39.8719|-75.2411|36|139|0
PHX|KPHX|Phoenix Sky Harbor||US|33.4353|-112.006|1135|145|0
PIE|KPIE|St. Petersburg Clearwater|Pinellas Park|US|27.9102|-82.6874|11|139|0
PIK|EGPK|Glasgow Prestwick|Prestwick, South Ayrshire|GB|55.5015|-4.5772|65|301|0
PIO|SPSO|Captain Renán Elías Olivera|Pisco|PE|-13.7449|-76.2203|39|121|0
PIT|KPIT|Pittsburgh||US|40.4915|-80.2329|1203|139|0
PKC|UHPP|Yelizovo|Petropavlovsk-Kamchatsky|RU|53.1687|158.451|131|212|0
PKX|ZBAD|Beijing Daxing||CN|39.5013|116.414|98|241|0
PKZ|VLPS|Pakse||LA|15.134|105.78|351|253|0
PLQ|EYPA|Palanga||LT|55.9732|21.0939|33|325|0
PLS|MBPV|Providenciales||TC|21.7737|-72.2683|15|104|0
PLX|UASS|Semei|Semey|KZ|50.3513|80.2344|761|180|0
PLZ|FAPE|Chief Dawid Stuurman|Gqeberha (Port Elizabeth)|ZA|-33.9897|25.6174|226|24|0
PMC|SCTE|El Tepual|Puerto Montt|CL|-41.4431|-73.0941|294|157|0
PMI|LEPA|Palma de Mallorca||ES|39.5517|2.7388|27|303|0
PMO|LICJ|Falcone–Borsellino|Palermo|IT|38.176|13.091|65|313|0
PMV|SVMG|Del Caribe Santiago Mariño|Isla Margarita|VE|10.9126|-63.9666|74|84|0
PNH|VDPP|Phnom Penh|Phnom Penh (Pou Senchey)|KH|11.5472|104.845|40|231|0
PNK|WIOO|Supadio|Pontianak|ID|-0.1523|109.404|10|232|0
PNQ|VAPO|Pune||IN|18.5821|73.9197|1942|216|0
PNR|FCPP|Antonio Agostinho-Neto|Pointe Noire|CG|-4.816|11.8866|55|11|0
PNS|KPNS|Pensacola||US|30.4727|-87.1866|121|87|0
POA|SBPA|Porto Alegre-Salgado Filho||BR|-29.994|-51.1675|11|159|0
POG|FOOG|Port Gentil||GA|-0.7117|8.7544|13|31|0
POM|AYPY|Port Moresby Jacksons||PG|-9.4434|147.22|146|365|0
POS|TTPP|Piarco|Port of Spain|TT|10.5953|-61.3376|58|147|0
POZ|EPPO|Poznań-Ławica||PL|52.4216|16.8234|308|327|0
PPG|NSTU|Pago Pago||AS|-14.331|-170.71|32|362|0
PPK|UACP|Petropavl||KZ|54.7756|69.1874|453|180|0
PPS|RPVP|Puerto Princesa International Airport / PAF Antonio Bautista||PH|9.742|118.759|71|224|0
PPT|NTAA|Fa'a'ā|Papeete|PF|-17.5535|-149.607|5|368|0
PQC|VVPQ|Phú Quốc|Phu Quoc Island|VN|10.1698|103.993|37|204|0
PRG|LKPR|Václav Havel Airport Prague||CZ|50.1009|14.2599|1247|311|0
PRN|BKPR|Priština Adem Jashari|Prishtina|XK|42.5728|21.0358|1789|281|0
PSA|LIRP|Pisa|Pisa (PI)|IT|43.6839|10.3927|6|313|0
PSD|HEPS|Port Said||EG|31.2793|32.2406|10|13|0
PSP|KPSP|Palm Springs||US|33.8297|-116.507|477|122|0
PSR|LIBP|Abruzzo|Pescara|IT|42.4311|14.183|48|313|0
PTG|FAPP|Polokwane||ZA|-23.8453|29.4586|4076|24|0
PTP|TFFR|Maryse Condé|Pointe-à-Pitre|GP|16.2654|-61.5328|36|106|0
PTY|MPTO|Tocumen||PA|9.0714|-79.3835|135|143|0
PUJ|MDPC|Punta Cana||DO|18.5671|-68.3646|47|158|0
PUQ|SCCI|President Carlos Ibáñez|Punta Arenas|CL|-53.0026|-70.8546|139|150|0
PUS|RKPK|Gimhae|Busan|KR|35.1795|128.938|6|240|0
PUY|LDPL|Pula||HR|44.8935|13.9222|274|328|0
PVD|KPVD|Rhode Island T. F. Green|Providence/Warwick|US|41.725|-71.4257|55|139|0
PVG|ZSPD|Shanghai Pudong|Shanghai (Pudong)|CN|31.1434|121.805|13|241|0
PVH|SBPV|Governador Jorge Teixeira de Oliveira|Porto Velho|BR|-8.7085|-63.9023|295|148|0
PVR|MMPR|Puerto Vallarta||MX|20.6799|-105.254|23|73|0
PWM|KPWM|Portland International Jetport||US|43.6462|-70.3093|76|139|0
PWQ|UASP|Pavlodar||KZ|52.195|77.0731|410|180|0
PYK|OIIP|Payam|Karaj|IR|35.7761|50.8267|4170|247|0
PZO|SVPR|General Manuel Carlos Piar|Guyana City|VE|8.2885|-62.7604|472|84|0
PZU|HSPN|Port Sudan New||SD|19.4346|37.2341|135|27|0
QRO|MMQT|Querétaro||MX|20.6188|-100.186|6296|132|0
RAI|GVNP|Nelson Mandela|Praia|CV|14.9411|-23.4847|230|262|0
RAK|GMMX|Marrakesh Menara||MA|31.6048|-8.0358|1545|14|0
RAR|NCRG|Rarotonga|Avarua|CK|-21.2027|-159.806|19|366|0
RBA|GMME|Rabat-Salé||MA|34.0515|-6.7515|276|14|0
RBR|SBRB|Rio Branco-Plácido de Castro||BR|-9.869|-67.894|633|155|0
RDU|KRDU|Raleigh-Durham|Raleigh/Durham|US|35.8787|-78.7873|435|139|0
REC|SBRF|Recife/Guararapes - Gilberto Freyre||BR|-8.1275|-34.923|33|152|0
RES|SARE|Resistencia||AR|-27.4499|-59.0561|173|59|0
REU|LERS|Reus||ES|41.1475|1.1684|233|303|0
RGL|SAWG|Piloto Civil Norberto Fernández|Rio Gallegos|AR|-51.6088|-69.3089|61|63|0
RGN|VYYY|Yangon||MM|16.9073|96.1332|109|256|0
RHO|LGRP|Rhodes International Airport Diagoras||GR|36.4054|28.0862|17|280|0
RIC|KRIC|Richmond||US|37.5052|-77.3197|167|139|0
RIX|EVRA|Riga||LV|56.9208|23.9707|36|312|0
RIY|OYRN|Riyan|Mukalla(Riyan)|YE|14.6622|49.3753|54|179|0
RJK|LDRI|Rijeka|Rijeka(Omišalj)|HR|45.2164|14.5709|278|328|0
RKT|OMRK|Ras Al Khaimah||AE|25.6135|55.9388|102|201|0
RKZ|ZURK|Xigaze Peace Airport / Shigatse|Xigazê (Samzhubzê)|CN|29.3509|89.2992|3782|0|0
RMF|HEMA|Marsa Alam||EG|25.5555|34.5924|213|13|0
RMI|LIPR|Federico Fellini|Rimini (RN)|IT|44.02|12.6122|40|313|0
RML|VCCC|Colombo Ratmalana||LK|6.8216|79.8859|22|197|0
RMO|LUKK|Chişinău||MD|46.9277|28.9317|399|287|0
RMQ|RCMQ|Taichung International Airport / Ching Chuang Kang|Taichung (Qingshui)|TW|24.2647|120.621|663|244|0
RMU|LEMI|Region of Murcia|Corvera|ES|37.8029|-1.1249|644|303|0
RNO|KRNO|Reno Tahoe||US|39.4991|-119.768|4415|122|0
ROB|GLRB|Roberts|Monrovia|LR|6.2338|-10.3623|31|41|0
ROC|KROC|Frederick Douglass Greater Rochester||US|43.1189|-77.6724|559|139|0
ROP|PGRO|Rota|Rota Island|MP|14.1733|145.241|607|367|0
ROR|PTRO|Roman Tmetuchl|Babelthuap Island|PW|7.367|134.544|176|363|0
ROS|SAAR|Rosario Islas Malvinas||AR|-32.9036|-60.785|85|59|0
ROV|URRP|Platov|Rostov-on-Don|RU|47.4939|39.9247|213|307|0
RSI|OERS|Red Sea|Hanak|SA|25.628|37.0889|140|237|0
RSW|KRSW|Southwest Florida|Fort Myers|US|26.5347|-81.7528|30|139|0
RTB|MHRO|Juan Manuel Gálvez|Coxen Hole|HN|16.3168|-86.523|39|169|0
RTM|EHRD|Rotterdam The Hague||NL|51.9569|4.4372|-15|278|0
RUH|OERK|King Khalid|Riyadh|SA|24.9576|46.6988|2049|237|0
RUN|FMEE|Roland Garros|Sainte-Marie|RE|-20.8901|55.5189|66|338|0
RVN|EFRO|Rovaniemi||FI|66.5633|25.8298|642|292|0
RZE|EPRZ|Rzeszów-Jasionka||PL|50.1098|22.0242|693|327|0
RZV|LTFO|Rize–Artvin||TR|41.1798|40.8488|16|294|0
SAG|VASD|Shirdi|Kakadi|IN|19.6892|74.3737|1926|216|0
SAH|OYSN|Sanaa||YE|15.4763|44.2197|7216|179|0
SAI|VDSA|Siem Reap-Angkor||KH|13.3697|104.224|191|231|0
SAL|MSLP|El Salvador International Airport Saint Óscar Arnulfo Romero y Galdámez|San Salvador (San Luis Talpa)|SV|13.4445|-89.0558|101|99|0
SAN|KSAN|San Diego||US|32.7336|-117.19|17|122|0
SAP|MHLM|Ramón Villeda Morales|San Pedro Sula|HN|15.4526|-87.9236|91|169|0
SAT|KSAT|San Antonio||US|29.5337|-98.4698|809|87|0
SAV|KSAV|Savannah Hilton Head||US|32.1266|-81.2|50|139|0
SAW|LTFJ|Istanbul Sabiha Gökçen|Pendik, Istanbul|TR|40.8986|29.3092|312|294|0
SBD|KSBD|San Bernardino||US|34.0967|-117.237|1159|122|0
SBZ|LRSB|Sibiu||RO|45.7858|24.0867|1496|285|0
SCL|SCEL|Comodoro Arturo Merino Benítez|Santiago|CL|-33.393|-70.7858|1555|157|0
SCO|UATE|Aktau||KZ|43.8601|51.0909|73|183|0
SCQ|LEST|Santiago-Rosalía de Castro|Santiago de Compostela|ES|42.8963|-8.4151|1213|303|0
SCR|ESKS|Scandinavian Mountains|Malung-Sälen|SE|61.1651|12.8335|1608|320|0
SCU|MUCU|Antonio Maceo|Santiago|CU|19.9747|-75.8355|249|111|0
SCV|LRSV|Suceava Ștefan cel Mare||RO|47.6875|26.3541|1375|285|0
SDF|KSDF|Louisville Muhammad Ali||US|38.1706|-85.7351|501|118|0
SDJ|RJSS|Sendai|Natori|JP|38.1397|140.917|15|249|0
SDQ|MDSD|Las Américas|Santo Domingo|DO|18.4297|-69.6689|59|158|0
SDU|SBRJ|Santos Dumont|Rio de Janeiro|BR|-22.9104|-43.1628|11|159|0
SEA|KSEA|Seattle–Tacoma||US|47.4479|-122.31|433|122|0
SEZ|FSIA|Seychelles|Victoria|SC|-4.6743|55.5218|10|334|0
SFB|KSFB|Orlando Sanford||US|28.7743|-81.2346|55|139|0
SFO|KSFO|San Francisco||US|37.6198|-122.375|13|122|0
SFS|RPLB|Subic Bay International Airport / Naval Air Station Cubi Point|Olongapo|PH|14.7948|120.272|64|224|0
SGC|USRR|Surgut||RU|61.3405|73.4058|200|257|0
SGN|VVTS|Tan Son Nhat|Ho Chi Minh City|VN|10.8188|106.652|33|204|0
SHA|ZSSS|Shanghai Hongqiao|Shanghai (Minhang)|CN|31.1981|121.334|10|241|0
SHE|ZYTX|Shenyang Taoxian||CN|41.6398|123.484|198|241|0
SHJ|OMSJ|Sharjah||AE|25.3286|55.5172|111|201|0
SHO|FDSK|King Mswati III|Mpaka|SZ|-26.3586|31.7169|1092|39|0
SID|GVAC|Amílcar Cabral|Espargos|CV|16.7414|-22.9494|177|262|0
SIN|WSSS|Singapore Changi||SG|1.3502|103.994|22|242|0
SIP|UKFF|Simferopol||UA|45.0522|33.9751|639|317|0
SJC|KSJC|Mineta San Jose||US|37.3625|-121.929|62|122|0
SJD|MMSD|Los Cabos|San José del Cabo|MX|23.1519|-109.721|374|129|0
SJJ|LQSA|Sarajevo||BA|43.8246|18.3315|1708|315|0
SJO|MROC|Juan Santamaría|San José (Alajuela)|CR|9.9939|-84.2088|3021|90|0
SJU|TJSJ|Luis Munoz Marin|San Juan|PR|18.4394|-66.0018|9|149|0
SJW|ZBSJ|Shijiazhuang Zhengding||CN|38.2807|114.697|233|241|0
SKB|TKPK|Robert L. Bradshaw|Basseterre|KN|17.3108|-62.7191|170|164|0
SKD|UZSS|Samarkand||UZ|39.7018|66.9815|2224|239|0
SKG|LGTS|Thessaloniki Macedonia||GR|40.5193|22.97|22|280|0
SKO|DNSO|Sadiq Abubakar III|Sokoto|NG|12.9157|5.2075|1010|30|0
SKP|LWSK|Skopje|Ilinden|MK|41.9581|21.6226|781|318|0
SKT|OPST|Sialkot||PK|32.5359|74.3646|837|213|0
SKX|UWPS|Saransk||RU|54.1251|45.2123|676|307|0
SLA|SASA|Martín Miguel de Güemes|Salta|AR|-24.856|-65.4862|4088|64|0
SLC|KSLC|Salt Lake City||US|40.7889|-111.98|4227|95|0
SLL|OOSA|Salalah||OM|17.0387|54.0913|73|225|0
SLZ|SBSL|Marechal Cunha Machado|São Luís|BR|-2.5864|-44.235|178|101|0
SMF|KSMF|Sacramento||US|38.6954|-121.591|27|122|0
SNA|KSNA|John Wayne Orange County|Santa Ana|US|33.6751|-117.869|56|122|0
SNC|SESA|General Ulpiano Paez|Salinas/La Libertad|EC|-2.2101|-80.9851|18|108|0
SNN|EINN|Shannon||IE|52.702|-8.9248|46|289|0
SNU|MUSC|Abel Santamaria|Santa Clara|CU|22.4922|-79.9431|338|111|0
SOC|WAHQ|Adisoemarmo|Surakarta|ID|-7.516|110.757|421|208|0
SOF|LBSF|Sofia||BG|42.6964|23.4177|1742|319|0
SPU|LDSP|Split Saint Jerome||HR|43.5389|16.298|79|328|0
SPX|HESX|Sphinx|Al Jiza|EG|30.1082|30.8957|510|13|0
SRE|SLAL|Alcantarí|Sucre|BO|-19.2468|-65.1496|10184|120|0
SRG|WAHS|Jenderal Ahmad Yani|Semarang|ID|-6.9707|110.373|10|208|0
SRQ|KSRQ|Sarasota Bradenton|Sarasota/Bradenton|US|27.3946|-82.5544|30|139|0
SRX|HLGD|Sirt International Airport / Ghardabiya||LY|31.0586|16.5971|267|49|0
SSA|SBSV|Deputado Luiz Eduardo Magalhães|Salvador|BR|-12.9086|-38.3225|64|72|0
SSG|FGSL|Malabo||GQ|3.7553|8.7087|76|36|0
SSH|HESH|Sharm El Sheikh||EG|27.9773|34.3947|191|13|0
STI|MDST|Cibao|Santiago|DO|19.4041|-70.6044|565|158|0
STL|KSTL|St. Louis Lambert|St Louis|US|38.7487|-90.37|618|87|0
STN|EGSS|London Stansted|London, Essex|GB|51.885|0.235|348|301|0
STR|EDDS|Stuttgart||DE|48.6899|9.222|1276|282|0
STT|TIST|Cyril E. King|Charlotte Amalie|VI|18.3371|-64.9773|23|166|0
STV|VASU|Surat||IN|21.1155|72.7433|16|216|0
SUB|WARR|Juanda|Surabaya|ID|-7.3798|112.787|9|208|0
SUF|LICA|Lamezia Terme Sant'Eufemia|Lamezia Terme (CZ)|IT|38.9062|16.246|39|313|0
SUV|NFNA|Nausori||FJ|-18.0442|178.561|17|346|0
SVD|TVSA|Argyle|Kingstown|VC|13.1597|-61.1488|136|167|0
SVG|ENZV|Stavanger Airport, Sola||NO|58.8767|5.6378|29|308|0
SVO|UUEE|Sheremetyevo|Moscow|RU|55.9769|37.4112|622|307|0
SVQ|LEZL|Seville||ES|37.418|-5.8931|112|303|0
SVX|USSS|Koltsovo|Yekaterinburg|RU|56.7431|60.8027|764|257|0
SWA|ZGOW|Jieyang Chaoshan|Jieyang (Rongcheng)|CN|23.552|116.503|0|241|0
SXB|LFST|Strasbourg||FR|48.5383|7.6282|505|309|0
SXM|TNCM|Princess Juliana|Sint Maarten|SX|18.041|-63.1089|13|123|0
SXR|VISR|Srinagar||IN|33.9871|74.7742|5429|216|0
SYD|YSSY|Sydney Kingsford Smith|Sydney (Mascot)|AU|-33.9461|151.177|21|277|0
SYR|KSYR|Syracuse Hancock||US|43.1112|-76.1063|421|139|0
SYX|ZJSY|Sanya Phoenix|Sanya (Tianya)|CN|18.3029|109.412|92|241|0
SYZ|OISS|Shiraz Shahid Dastghaib||IR|29.5392|52.5898|4927|247|0
SZB|WMSA|Sultan Abdul Aziz Shah|Subang|MY|3.1306|101.549|90|218|0
SZG|LOWS|Salzburg||AT|47.7933|13.0043|1411|282|0
SZX|ZGSZ|Shenzhen Bao'an||CN|22.6395|113.803|13|241|0
SZZ|EPSC|Solidarity Szczecin–Goleniów|Szczecin(Glewice)|PL|53.5847|14.9022|154|327|0
TAB|TTCP|A.N.R. Robinson|Scarborough|TT|11.1496|-60.8313|38|147|0
TAE|RKTN|Daegu||KR|35.8944|128.657|116|240|0
TAG|RPSP|Bohol-Panglao||PH|9.573|123.77|42|224|0
TAK|RJOT|Takamatsu||JP|34.215|134.016|607|249|0
TAO|ZSQD|Qingdao Jiaodong|Qingdao (Jiaozhou)|CN|36.362|120.088|30|241|0
TAS|UZTT|Tashkent||UZ|41.2579|69.2812|1417|245|0
TAZ|UTAT|Dashoguz|Daşoguz|TM|41.7599|59.8361|272|185|0
TBS|UGTB|Tbilisi||GE|41.6692|44.9547|1624|246|0
TBU|NFTF|Fua'amotu|Nuku'alofa|TO|-21.2414|-175.149|126|370|0
TBZ|OITT|Tabriz||IR|38.1339|46.235|4459|247|0
TET|FQTT|Tete||MZ|-16.1048|33.6402|525|37|0
TFN|GCXO|Tenerife Norte-Ciudad de La Laguna||ES|28.4828|-16.3417|2076|261|0
TFS|GCTS|Tenerife Sur||ES|28.0445|-16.5725|209|261|0
TFU|ZUTF|Chengdu Tianfu|Chengdu (Jianyang)|CN|30.3125|104.441|1440|241|0
TGD|LYPG|Podgorica Airport / Podgorica Golubovci||ME|42.3594|19.2519|141|310|0
THR|OIII|Mehrabad|Tehran|IR|35.6892|51.3144|3962|247|0
TIA|LATI|Tirana International Airport Mother Teresa|Rinas|AL|41.4147|19.7206|126|322|0
TIF|OETF|Taif||SA|21.4847|40.5441|4848|237|0
TIJ|MMTJ|General Abelardo L. Rodriguez|Tijuana|MX|32.541|-116.97|489|122|0
TIR|VOTP|Tirupati||IN|13.632|79.5399|350|216|0
TJM|USTR|Roshchino|Tyumen|RU|57.179|65.3277|378|257|0
TJU|UTDK|Kulob||TJ|37.9881|69.805|2293|202|0
TKK|PTKK|Chuuk|Weno Island|FM|7.4619|151.843|11|343|0
TKS|RJOS|Tokushima Awaodori Airport / JMSDF Tokushima||JP|34.1326|134.608|26|249|0
TKU|EFTU|Turku||FI|60.5141|22.2628|161|292|0
TLC|MMTO|Adolfo López Mateos|Toluca|MX|19.3369|-99.5658|8466|132|0
TLL|EETN|Lennart Meri Tallinn||EE|59.4132|24.8326|131|321|0
TLM|DAON|Zenata – Messali El Hadj||DZ|35.0127|-1.4571|814|4|0
TLS|LFBO|Toulouse-Blagnac|Toulouse/Blagnac|FR|43.6291|1.3638|499|309|0
TLV|LLBG|Ben Gurion|Tel Aviv|IL|32.0114|34.8867|135|210|0
TML|DGLE|Yakubu Tali|Tamale|GH|9.5539|-0.8661|553|2|0
TMM|FMMT|Toamasina Ambalamanasy||MG|-18.1135|49.3923|22|330|0
TMP|EFTP|Tampere-Pirkkala|Tampere / Pirkkala|FI|61.4141|23.6044|390|292|0
TMR|DAAT|Aguenar – Hadj Bey Akhamok|Tamanrasset|DZ|22.811|5.4508|4518|4|0
TMS|FPST|São Tomé||ST|0.3782|6.7122|33|48|0
TNA|ZSJN|Jinan Yaoqiang|Jinan (Licheng)|CN|36.8572|117.216|76|241|0
TNG|GMTT|Tangier Ibn Battuta||MA|35.7317|-5.9215|62|14|0
TNN|RCNN|Tainan International Airport / Tainan|Tainan (Rende)|TW|22.9504|120.206|63|244|0
TNR|FMMI|Ivato|Antananarivo|MG|-18.7969|47.4788|4198|330|0
TOF|UNTT|Tomsk Kamov||RU|56.3803|85.2083|597|250|0
TOM|GATB|Tombouktou|Timbuktu|ML|16.7305|-3.0076|863|6|0
TOS|ENTC|Tromsø||NO|69.6833|18.9189|31|308|0
TPA|KTPA|Tampa||US|27.9755|-82.5332|26|139|0
TPE|RCTP|Taiwan Taoyuan||TW|25.0777|121.233|106|244|0
TQO|MMTL|Felipe Carrillo Puerto International Airport Tulum||MX|20.1721|-87.6603|66|83|0
TRD|ENVA|Trondheim Airport, Værnes||NO|63.4578|10.924|56|308|0
TRF|ENTO|Sandefjord Airport, Torp|Sandefjord(Torp)|NO|59.1867|10.2586|286|308|0
TRN|LIMF|Turin|Caselle Torinese (TO)|IT|45.2008|7.6496|989|313|0
TRS|LIPQ|Trieste|Ronchi dei Legionari/Trieste|IT|45.8279|13.4667|39|313|0
TRU|SPRU|Capitán FAP Carlos Martínez de Pinillos|Trujillo|PE|-8.0824|-79.1088|106|121|0
TRV|VOTV|Thiruvananthapuram||IN|8.4819|76.92|15|216|0
TRW|NGTA|Bonriki|South Tarawa|KI|1.3816|173.147|9|369|0
TRZ|VOTR|Tiruchirappalli||IN|10.7629|78.7177|288|216|0
TSA|RCSS|Taipei Songshan|Taipei (Songshan)|TW|25.0672|121.553|18|244|0
TSF|LIPH|Treviso|Treviso (TV)|IT|45.6484|12.1944|59|313|0
TSN|ZBTJ|Tianjin Binhai||CN|39.1244|117.346|10|241|0
TSR|LRTR|Timișoara Traian Vuia|Timişoara|RO|45.8099|21.3379|348|285|0
TTU|GMTN|Sania Ramel|Tétouan|MA|35.5943|-5.32|10|14|0
TUC|SANT|Teniente Benjamín Matienzo|San Miguel de Tucumán|AR|-26.8374|-65.1042|1493|67|0
TUK|OPTU|Turbat||PK|25.9848|63.0289|498|213|0
TUL|KTUL|Tulsa||US|36.1971|-95.8862|677|87|0
TUN|DTTA|Tunis Carthage||TN|36.851|10.2272|22|50|0
TUS|KTUS|Tucson||US|32.115|-110.938|2643|145|0
TUU|OETB|Prince Sultan bin Abdulaziz|Tabuk|SA|28.3711|36.6249|2551|237|0
TXN|ZSTX|Huangshan Tunxi||CN|29.7333|118.256|0|241|0
TYN|ZBYN|Taiyuan Wusu||CN|37.7469|112.628|2575|241|0
TYS|KTYS|McGhee Tyson|Knoxville/Maryville|US|35.811|-83.994|981|139|0
TZL|LQTZ|Tuzla|Dubrave Gornje|BA|44.4599|18.7236|784|315|0
UBN|ZMCK|Ulaanbaatar Chinggis Khaan|Ulaanbaatar (Sergelen)|MN|47.6469|106.82|4482|251|0
UDJ|UKLU|Uzhhorod||UA|48.6343|22.2634|383|283|0
UET|OPQT|Quetta||PK|30.2514|66.9378|5267|213|0
UFA|UWUU|Ufa||RU|54.5575|55.8744|449|257|0
UGC|UZNU|Urgench||UZ|41.5827|60.6434|320|239|0
UIO|SEQM|Mariscal Sucre|Quito|EC|-0.1254|-78.3543|7841|108|0
UKB|RJBE|Kobe||JP|34.6328|135.224|22|249|0
UKK|UASK|Oskemen|Ust-Kamenogorsk (Oskemen)|KZ|50.035|82.4961|939|180|0
ULH|OEAO|Al-Ula||SA|26.4836|38.117|2050|237|0
ULN|ZMUB|Buyant-Ukhaa|Ulaanbaatar|MN|47.8431|106.767|4364|251|0
UME|ESNU|Umeå||SE|63.7918|20.2828|24|320|0
UPG|WAAA|Sultan Hasanuddin|Makassar|ID|-5.0755|119.554|47|223|0
URA|UARR|Manshuk Mametova|Uralsk|KZ|51.152|51.5437|125|230|0
URC|ZWWW|Ürümqi Tianshan||CN|43.9136|87.4794|2125|241|0
USM|VTSM|Samui|Na Thon (Ko Samui Island)|TH|9.5478|100.062|64|190|0
UTH|VTUD|Udon Thani||TH|17.3862|102.789|579|190|0
UTP|VTBU|U-Tapao–Rayong–Pattaya||TH|12.6799|101.005|42|190|0
UUD|UIUU|Baikal|Ulan Ude|RU|51.8086|107.44|1690|207|0
UUS|UHSS|Yuzhno-Sakhalinsk||RU|46.8855|142.718|59|238|0
UVF|TLPL|Hewanorra|Vieux Fort|LC|13.7332|-60.9526|14|165|0
UYU|SLUY|Joya Andina|Quijarro|BO|-20.4413|-66.8576|11136|120|0
VAA|EFVA|Vaasa||FI|63.0502|21.7625|19|292|0
VAR|LBWN|Varna||BG|43.2321|27.8251|230|319|0
VAV|NFTV|Vava'u|Vava'u Island|TO|-18.5853|-173.962|236|370|0
VBY|ESSV|Visby||SE|57.6628|18.3462|164|320|0
VCA|VVCT|Can Tho||VN|10.0834|105.709|9|204|0
VCE|LIPZ|Venice Marco Polo|Venezia (VE)|IT|45.5053|12.3519|7|313|0
VCP|SBKP|Viracopos|Campinas|BR|-23.0074|-47.1345|2170|159|0
VER|MMVR|General Heriberto Jara|Veracruz|MX|19.1396|-96.1886|90|132|0
VFA|FVFA|Victoria Falls||ZW|-18.0974|25.8369|3490|23|0
VGA|VOBZ|Vijayawada||IN|16.53|80.8049|82|216|0
VIE|LOWW|Vienna||AT|48.1103|16.5697|600|324|0
VIL|GMMH|Dakhla||EH|23.7183|-15.932|36|20|0
VIX|SBVT|Eurico de Aguiar Salles|Vitória|BR|-20.258|-40.285|34|159|0
VKO|UUWW|Vnukovo|Moscow|RU|55.5915|37.2615|685|307|0
VLC|LEVC|Valencia||ES|39.4892|-0.481|240|303|0
VLI|NVVV|Bauerfield|Port Vila|VU|-17.6993|168.32|70|345|0
VLN|SVVA|Arturo Michelena|Valencia|VE|10.1497|-67.9284|1411|84|0
VNO|EYVI|Vilnius||LT|54.6341|25.2858|648|325|0
VNS|VEBN|Lal Bahadur Shastri|Varanasi|IN|25.4522|82.8625|266|216|0
VOG|URWW|Volgograd||RU|48.7813|44.3392|482|326|0
VRA|MUVR|Juan Gualberto Gomez|Matanzas|CU|23.0344|-81.4353|210|111|0
VRN|LIPX|Verona Villafranca Valerio Catullo|Caselle (VR)|IT|45.395|10.8873|239|313|0
VSA|MMVA|Carlos Rovirosa Pérez|Villahermosa|MX|17.9943|-92.8182|46|132|0
VST|ESOW|Stockholm Västerås|Stockholm / Västerås|SE|59.5894|16.6336|21|320|0
VTE|VLVT|Wattay|Vientiane|LA|17.9851|102.567|564|253|0
VTZ|VOVI|Alluri Sitarama Raju International Airport (Vizag)|Visakhapatnam|IN|17.9715|83.5036|188|216|0
VVI|SLVR|Viru Viru|Santa Cruz|BO|-17.6448|-63.1354|1224|120|0
VVO|UHWW|Vladivostok|Artyom|RU|43.3963|132.148|59|254|0
VXE|GVSV|Cesaria Evora|São Pedro|CV|16.8334|-25.0553|66|262|0
WAW|EPWA|Warsaw Chopin||PL|52.1657|20.9671|362|327|0
WDH|FYWH|Hosea Kutako|Windhoek|NA|-22.4799|17.4709|5640|51|0
WLG|NZWN|Wellington||NZ|-41.3268|174.807|41|340|0
WLS|NLWW|Hihifo|Wallis Island|WF|-13.2394|-176.199|79|372|0
WMI|EPMO|Warsaw Modlin|Nowy Dwór Mazowiecki|PL|52.4511|20.6518|341|327|0
WNZ|ZSWZ|Wenzhou Longwan|Wenzhou (Longwan)|CN|27.9106|120.853|13|241|0
WRO|EPWR|Copernicus Wrocław||PL|51.1037|16.8821|404|327|0
WSI|YSWS|Western Sydney International (Nancy-Bird Walton)||AU|-33.8835|150.713|262|277|0
WTB|YBWW|Toowoomba Wellcamp||AU|-27.5583|151.793|1509|269|0
WUH|ZHHH|Wuhan Tianhe|Wuhan (Huangpi)|CN|30.7748|114.214|113|241|0
WUX|ZSWX|Sunan Shuofang|Wuxi|CN|31.497|120.43|24|241|0
WVB|FYWB|Walvis Bay|Walvis Bay(Rooikop)|NA|-22.9793|14.6471|299|51|0
XBJ|OIMB|Birjand||IR|32.8965|59.2813|4952|247|0
XIY|ZLXY|Xi'an Xianyang||CN|34.4422|108.762|1572|241|0
XMN|ZSAM|Xiamen Gaoqi||CN|24.5439|118.127|59|241|0
XNN|ZLXN|Xining Caojiabao|Haidong (Huzhu Tu Autonomous County)|CN|36.5277|102.04|7119|241|0
XPL|MHPR|Palmerola||HN|14.3824|-87.6212|2061|169|0
YAP|PTYA|Yap|Yap Island|FM|9.4989|138.083|91|343|0
YCU|ZBYC|Yuncheng Yanhu|Yuncheng (Yanhu)|CN|35.1178|111.034|1242|241|0
YEG|CYEG|Edmonton||CA|53.3097|-113.58|2373|98|0
YHZ|CYHZ|Halifax / Stanfield||CA|44.8808|-63.5086|477|110|0
YIA|WAHI|Yogyakarta||ID|-7.9053|110.057|24|208|0
YIW|ZSYW|Yiwu|Yiwu/Jinhua|CN|29.3421|120.031|262|241|0
YKS|UEEE|Platon Oyunsky Yakutsk||RU|62.0933|129.771|325|255|0
YLW|CYLW|Kelowna||CA|49.9561|-119.378|1421|174|0
YNB|OEYN|Prince Abdulmohsen Bin Abdulaziz|Yanbu|SA|24.1442|38.0634|26|237|0
YNT|ZSYT|Yantai Penglai||CN|37.6597|120.978|154|241|0
YNY|RKNY|Yangyang|Gonghang-ro|KR|38.0605|128.67|241|240|0
YNZ|ZSYN|Yancheng Nanyang|Yancheng (Tinghu)|CN|33.4283|120.205|10|241|0
YOW|CYOW|Ottawa Macdonald-Cartier||CA|45.3225|-75.6692|374|172|0
YQB|CYQB|Quebec Jean Lesage||CA|46.7911|-71.3933|244|172|0
YUL|CYUL|Montreal / Pierre Elliott Trudeau|Montréal|CA|45.4678|-73.7423|118|172|0
YVR|CYVR|Vancouver||CA|49.1939|-123.184|14|174|0
YWG|CYWG|Winnipeg / James Armstrong Richardson||CA|49.91|-97.2399|783|176|0
YXE|CYXE|Saskatoon John G. Diefenbaker||CA|52.1707|-106.701|1653|153|0
YYC|CYYC|Calgary||CA|51.1188|-114.01|3557|98|0
YYJ|CYYJ|Victoria||CA|48.6472|-123.428|63|174|0
YYT|CYYT|St. John's||CA|47.6186|-52.7519|461|163|0
YYZ|CYYZ|Toronto Pearson||CA|43.6759|-79.6294|569|172|0
ZAD|LDZD|Zadar||HR|44.097|15.3536|289|328|0
ZAG|LDZA|Zagreb Franjo Tuđman|Velika Gorica|HR|45.7429|16.0688|353|328|0
ZAH|OIZH|Zahedan||IR|29.4757|60.9062|4564|247|0
ZAM|RPMZ|Zamboanga||PH|6.9224|122.06|33|224|0
ZAZ|LEZG|Zaragoza||ES|41.6662|-1.0415|863|303|0
ZCO|SCQP|La Araucanía|Temuco|CL|-38.9259|-72.6515|333|157|0
ZHA|ZGZJ|Zhanjiang Wuchuan||CN|21.4817|110.59|0|241|0
ZIA|UUBW|Zhukovsky|Moscow|RU|55.5533|38.15|377|307|0
ZIH|MMZH|Ixtapa-Zihuatanejo||MX|17.6018|-101.461|26|132|0
ZNZ|HTZA|Abeid Amani Karume|Zanzibar|TZ|-6.222|39.2249|54|17|0
ZQN|NZQN|Queenstown||NZ|-45.0192|168.746|1171|340|0
ZRH|LSZH|Zürich|Zurich|CH|47.4581|8.5481|1417|329|0
ZSA|MYSM|San Salvador||BS|24.063|-74.5232|24|138|0
ZSE|FMEP|Saint-Pierre Pierrefonds||RE|-21.3194|55.4225|59|338|0
ZUH|ZGSD|Zhuhai Jinwan|Zhuhai (Jinwan)|CN|22.0064|113.376|23|241|0
ZYL|VGSY|Osmany|Sylhet|BD|24.964|91.8647|50|199|0
AAA|NTGA|Anaa||PF|-17.3526|-145.51|10|368|1
AAP|WALS|Aji Pangeran Tumenggung Pranoto|Samarinda|ID|-0.3745|117.25|82|223|1
AAQ|URKA|Anapa Vityazevo|Krasnyi Kurgan|RU|45.0021|37.3473|174|307|1
AAT|ZWAT|Altay Xuedu||CN|47.7499|88.0858|2460|241|1
AAX|SBAX|Romeu Zema|Araxá|BR|-19.5632|-46.9604|3276|159|1
AAY|OYGD|Al Ghaydah||YE|16.1933|52.1742|134|179|1
ABE|KABE|Lehigh Valley|Allentown/Bethlehem|US|40.6518|-75.4428|393|139|1
ABI|KABI|Abilene||US|32.4113|-99.6819|1791|87|1
ABK|HAKD|Kebri Dahar||ET|6.7326|44.2413|1800|3|1
ABL|PAFM|Ambler||US|67.1055|-157.855|334|53|1
ABR|KABR|Aberdeen||US|45.4491|-98.4218|1302|87|1
ABS|HEBL|Abu Simbel||EG|22.3759|31.6117|614|13|1
ABT|OEBA|King Saud Bin Abdulaziz (Al Baha)|Al-Baha|SA|20.2985|41.6362|5486|237|1
ABX|YMAY|Albury|East Albury|AU|-36.0668|146.959|539|275|1
ABY|KABY|Southwest Georgia|Albany|US|31.5329|-84.1962|197|139|1
ACH|LSZR|Sankt Gallen Altenrhein|St. Gallen|CH|47.485|9.5608|1306|324|1
ACI|EGJA|Alderney|Saint Anne|GG|49.7061|-2.2147|290|291|1
ACK|KACK|Nantucket Memorial||US|41.2531|-70.0602|47|139|1
ACT|KACT|Waco||US|31.6113|-97.2305|516|87|1
ACV|KACV|California Redwood Coast-Humboldt|Arcata/Eureka|US|40.9781|-124.109|221|122|1
ACX|ZUYI|Xingyi Wanfenglin||CN|25.0834|104.961|4150|241|1
ACY|KACY|Atlantic City||US|39.4562|-74.5775|75|139|1
ADF|LTCP|Adıyaman||TR|37.7314|38.4689|2216|294|1
ADK|PADK|Adak||US|51.8836|-176.643|18|52|1
ADQ|PADQ|Kodiak||US|57.75|-152.494|78|53|1
ADU|OITL|Ardabil||IR|38.3257|48.4244|4315|247|1
AEB|ZGBS|Baise (Bose) Bama|Baise (Tianyang)|CN|23.7206|106.96|490|241|1
AEU|OIBA|Abu Musa Island||IR|25.8757|55.033|23|247|1
AEX|KAEX|Alexandria||US|31.3258|-92.5467|89|87|1
AFA|SAMR|Suboficial Ay Santiago Germano|San Rafael|AR|-34.5883|-68.4039|2470|62|1
AFL|SBAT|Piloto Osvaldo Marques Dias|Alta Floresta|BR|-9.8664|-56.1063|948|91|1
AFZ|OIMS|Sabzevar||IR|36.1681|57.5952|3010|247|1
AGH|ESTA|Ängelholm-Helsingborg||SE|56.2961|12.8471|68|320|1
AGR|VIAG|Agra Airport / Agra Air Force Station||IN|27.158|77.961|551|216|1
AGS|KAGS|Augusta Regional At Bush Field||US|33.3699|-81.9645|144|139|1
AGX|VOAT|Agatti||IN|10.8237|72.176|14|216|1
AHA|VEAP|Maa Mahamaya|Ambikapur|IN|22.9875|83.1961|1930|0|1
AHE|NTHE|Ahe|Ahe Atoll|PF|-14.4281|-146.257|11|368|1
AHO|LIEA|Alghero-Fertilia||IT|40.6321|8.2908|87|313|1
AHU|GMTA|Cherif Al Idrissi|Al Hoceima|MA|35.1771|-3.8395|95|14|1
AIA|KAIA|Alliance||US|42.0525|-102.804|3931|95|1
AIN|PAWI|Wainwright||US|70.638|-159.995|41|53|1
AJA|LFKJ|Ajaccio Napoléon Bonaparte airport||FR|41.9236|8.8029|18|309|1
AJI|LTCO|Ağrı||TR|39.6556|43.0257|5462|294|1
AJL|VELP|Lengpui|Aizawl (Lengpui)|IN|23.8406|92.6197|1398|216|1
AJN|FMCV|Ouani||KM|-12.131|44.43|62|333|1
AJR|ESNX|Arvidsjaur||SE|65.5903|19.2819|1245|320|1
AJU|SBAR|Aracaju - Santa Maria||BR|-10.9839|-37.0729|23|124|1
AKF|HLKF|Kufra||LY|24.1787|23.314|1367|49|1
AKJ|RJEC|Asahikawa|Higashikagura|JP|43.6708|142.447|721|249|1
AKN|PAKN|King Salmon||US|58.6778|-156.652|73|53|1
AKP|PAKP|Anaktuvuk Pass||US|68.1336|-151.743|2102|53|1
AKR|DNAK|Akure||NG|7.2467|5.301|1100|30|1
AKU|ZWAK|Aksu Hongqipo|Aksu (Onsu)|CN|41.2625|80.2917|3816|241|1
AKY|VYSW|Sittwe||MM|20.1332|92.8707|27|256|1
ALF|ENAT|Alta||NO|69.9761|23.3717|9|308|1
ALH|YABA|Albany||AU|-34.9433|117.809|233|276|1
ALO|KALO|Waterloo||US|42.5571|-92.4003|873|87|1
ALS|KALS|San Luis Valley Regional Airport/Bergman Field|Alamosa|US|37.4349|-105.867|7539|95|1
ALW|KALW|Walla Walla||US|46.0949|-118.288|1194|122|1
AMA|KAMA|Rick Husband Amarillo||US|35.2179|-101.706|3607|87|1
AMH|HAAM|Arba Minch||ET|6.0394|37.5905|3901|3|1
AMV|ULDD|Amderma||RU|69.7633|61.5564|13|307|1
ANI|PANI|Aniak||US|61.5816|-159.543|88|53|1
ANR|EBAW|Antwerp International Airport (Deurne)||BE|51.1907|4.4632|39|284|1
ANV|PANV|Anvik||US|62.6467|-160.191|291|53|1
ANX|ENAN|Andøya Airport, Andenes||NO|69.2952|16.1394|43|308|1
AOG|ZYAS|Anshan Teng'ao Airport / Anshan||CN|41.1053|122.854|0|241|1
AOI|LIPY|Marche|Falconara Marittima (AN)|IT|43.6163|13.3623|49|313|1
AOK|LGKP|Karpathos|Karpathos Island|GR|35.4214|27.146|66|280|1
AOO|KAOO|Altoona Blair||US|40.2964|-78.32|1503|139|1
AOR|WMKA|Sultan Abdul Halim|Alor Satar|MY|6.1897|100.398|15|218|1
APN|KAPN|Alpena County||US|45.0781|-83.5603|690|96|1
APO|SKLC|Antonio Roldán Betancur|Carepa|CO|7.812|-76.7164|46|79|1
AQA|SBAQ|Araraquara||BR|-21.812|-48.133|2334|159|1
AQG|ZSAQ|Anqing Tianzhushan Airport / Anqing North||CN|30.5822|117.05|0|241|1
ARC|PARC|Arctic Village||US|68.1147|-145.579|2092|53|1
ARH|ULAA|Talagi|Archangelsk|RU|64.6003|40.7167|62|307|1
ARI|SCAR|Chacalluta|Arica|CL|-18.3485|-70.3387|167|121|1
ARK|HTAR|Arusha||TZ|-3.3678|36.6333|4550|17|1
ARM|YARM|Armidale||AU|-30.5281|151.617|3556|277|1
ART|KART|Watertown||US|43.9919|-76.0217|325|139|1
ARU|SBAU|Araçatuba||BR|-21.1415|-50.4246|1358|159|1
ARW|LRAR|Arad||RO|46.1761|21.2643|352|285|1
ASD|MYAF|Andros Town||BS|24.6979|-77.7956|5|138|1
ASE|KASE|Aspen-Pitkin County Airport (Sardy Field)||US|39.2232|-106.869|7820|95|1
ASI|FHAW|RAF Ascension Island|Cat Hill|SH|-7.9702|-14.3927|278|266|1
ASJ|RJKA|Amami||JP|28.4306|129.713|27|249|1
ASM|HHAS|Asmara||ER|15.2919|38.9107|7661|5|1
ASO|HASO|Asosa||ET|10.0185|34.5863|5100|3|1
ASP|YBAS|Alice Springs||AU|-23.8066|133.903|1789|271|1
ASV|HKAM|Amboseli|Ol Tukai|KE|-2.6448|37.2529|3755|42|1
ATC|MYCA|Arthur's Town||BS|24.6294|-75.6738|18|138|1
ATK|PATQ|Atqasuk Edward Burnell Sr Memorial||US|70.467|-157.436|96|53|1
ATM|SBHT|Altamira Interstate||BR|-3.2531|-52.2539|368|156|1
ATW|KATW|Appleton||US|44.2585|-88.519|918|87|1
ATY|KATY|Watertown||US|44.914|-97.1547|1749|87|1
AUC|SKUC|Santiago Perez|Arauca|CO|7.0689|-70.7369|420|79|1
AUG|KAUG|Augusta State||US|44.3206|-69.7973|352|139|1
AUQ|NTMN|Hiva Oa-Atuona|Hiva Oa Island|PF|-9.7688|-139.011|1481|357|1
AUR|LFLW|Aurillac airport||FR|44.8914|2.4219|2096|309|1
AUX|SWGN|Araguaína||BR|-7.2279|-48.2405|771|56|1
AVA|ZUAS|Anshun Huangguoshu|Anshun (Xixiu)|CN|26.2606|105.873|4812|241|1
AVK|ZMAH|Arvaikheer||MN|46.2503|102.802|5932|251|1
AVL|KAVL|Asheville||US|35.4355|-82.5419|2165|139|1
AVN|LFMV|Avignon Caumont airport||FR|43.9073|4.9018|124|309|1
AVP|KAVP|Wilkes-Barre/Scranton||US|41.3371|-75.7242|962|139|1
AVR|VAAM|Amravati||IN|20.8146|77.7178|1125|299|1
AWK|PWAK|Wake Island||UM|19.2824|166.637|14|371|1
AXA|TQPF|Clayton J. Lloyd|The Valley|AI|18.2048|-63.0538|127|54|1
AXD|LGAL|Alexandroupoli Democritus|Alexandroupolis|GR|40.8559|25.9563|24|280|1
AXF|ZBAL|Alxa Left Banner Bayanhot||CN|38.7483|105.584|4560|241|1
AXJ|RJDA|Amakusa||JP|32.4825|130.159|340|249|1
AXM|SKAR|El Eden|Armenia|CO|4.4528|-75.7664|3990|79|1
AXP|MYAP|Spring Point||BS|22.4418|-73.9709|11|138|1
AXR|NTGU|Arutua||PF|-15.2483|-146.617|9|368|1
AXT|RJSK|Akita||JP|39.6156|140.219|313|249|1
AXU|HAAX|Axum||ET|14.1468|38.7728|6959|3|1
AYJ|VEAY|Maharshi Valmiki|Faizabad|IN|26.7477|82.1637|335|216|1
AYP|SPHO|Air Force Colonel Alfredo Mendivil Duarte|Ayacucho|PE|-13.1548|-74.2044|8917|121|1
AYQ|YAYE|Ayers Rock Connellan|Yulara|AU|-25.1859|130.977|1626|271|1
AZA|KIWA|Mesa Gateway||US|33.3078|-111.655|1382|145|1
AZD|OIYY|Shahid Sadooghi|Yazd|IR|31.9049|54.2765|4054|247|1
AZN|UZFA|Andijan||UZ|40.7277|72.294|1515|245|1
AZO|KAZO|Kalamazoo/Battle Creek||US|42.2321|-85.5496|874|96|1
AZR|DAUA|Touat-Cheikh Sidi Mohamed Belkebir|Adrar|DZ|27.8376|-0.1864|919|4|1
AZS|MDCY|Samaná El Catey|Samana|DO|19.2693|-69.7374|30|158|1
BAL|LTCJ|Batman||TR|37.929|41.1166|1822|294|1
BAR|ZJQH|Qionghai Bo'ao|Qionghai (Basuo)|CN|19.141|110.453|30|241|1
BAY|LRBM|Maramureș|Tăuții-Măgherăuș|RO|47.6584|23.4644|605|285|1
BBA|SCBA|Balmaceda||CL|-45.916|-71.6895|1722|157|1
BBM|VDBG|Battambang||KH|13.0956|103.224|59|231|1
BBN|WBGZ|Bario||MY|3.7346|115.478|3350|219|1
BBO|HCMI|Berbera||SO|10.385|44.9367|30|40|1
BBQ|TAPB|Burton-Nibbs|Codrington|AG|17.6212|-61.7983|28|55|1
BCA|MUBA|Gustavo Rizo|Baracoa|CU|20.3653|-74.5062|26|111|1
BCH|WPEC|Baucau||TL|-8.4865|126.4|1771|200|1
BCI|YBAR|Barcaldine||AU|-23.5663|145.302|878|269|1
BCO|HABC|Jinka||ET|5.7497|36.5602|4475|3|1
BDB|YBUD|Bundaberg||AU|-24.905|152.323|107|269|1
BDH|OIBL|Bandar Lengeh||IR|26.5323|54.8248|67|247|1
BDO|WICC|Husein Sastranegara|Bandung|ID|-6.9006|107.576|2436|208|1
BDT|FZFD|Gbadolite||CD|4.2527|20.9753|1509|29|1
BDU|ENDU|Bardufoss|Målselv|NO|69.0558|18.5404|252|308|1
BEB|EGPL|Benbecula|Balivanich|GB|57.4811|-7.3628|19|301|1
BED|KBED|Laurence G Hanscom Field|Bedford|US|42.47|-71.289|133|139|1
BEF|MNBL|Bluefields||NI|11.991|-83.7741|20|125|1
BEJ|WAQT|Kalimarau|Tanjung Redeb - Borneo Island|ID|2.1478|117.431|59|223|1
BEK|VIBY|Bareilly Air Force Station||IN|28.4221|79.4508|580|216|1
BET|PABE|Bethel||US|60.7798|-161.838|126|53|1
BEU|YBIE|Bedourie||AU|-24.3461|139.46|300|269|1
BFD|KBFD|Bradford||US|41.8031|-78.6401|2143|139|1
BFF|KBFF|Western Neb. Rgnl/William B. Heilig|Scottsbluff|US|41.874|-103.596|3967|95|1
BFI|KBFI|King County International Airport - Boeing Field|Seattle|US|47.527|-122.3|21|122|1
BFJ|ZUBJ|Bijie Feixiong||CN|27.2671|105.472|4751|241|1
BFL|KBFL|Meadows Field|Bakersfield|US|35.4336|-119.057|510|122|1
BFV|VTUO|Buri Ram|Buriram|TH|15.2295|103.253|590|190|1
BFY|ZSBA|Bengbu Tenghu||CN|33.1663|117.058|0|0|1
BGA|SKBG|Palonegro|Bucaramanga|CO|7.1265|-73.1848|3897|79|1
BGC|LPBG|Bragança||PT|41.8578|-6.7071|2241|299|1
BGM|KBGM|Greater Binghamton/Edwin A Link field||US|42.2087|-75.9798|1636|139|1
BGR|KBGR|Bangor||US|44.8064|-68.8267|192|139|1
BHB|KBHB|Hancock County-Bar Harbor||US|44.45|-68.3615|83|139|1
BHD|EGAC|George Best Belfast City||GB|54.6181|-5.8725|15|301|1
BHE|NZWB|Woodbourne|Blenheim|NZ|-41.5183|173.87|109|340|1
BHH|OEBH|Bisha||SA|19.9844|42.6209|3887|237|1
BHI|SAZB|Comandante Espora|Bahía Blanca|AR|-38.725|-62.1693|246|57|1
BHJ|VABJ|Bhuj||IN|23.2878|69.6702|268|216|1
BHQ|YBHI|Broken Hill||AU|-32.0014|141.472|958|270|1
BHS|YBTH|Bathurst||AU|-33.4068|149.651|2435|277|1
BHU|VABV|Bhavnagar||IN|21.7522|72.1852|44|216|1
BHV|OPBW|Bahawalpur||PK|29.3481|71.718|392|213|1
BHY|ZGBH|Beihai Fucheng||CN|21.5387|109.294|75|241|1
BIH|KBIH|Eastern Sierra|Bishop|US|37.3731|-118.364|4124|122|1
BIK|WABB|Frans Kaisiepo|Biak|ID|-1.19|136.108|46|209|1
BIL|KBIL|Billings Logan||US|45.8089|-108.541|3652|95|1
BIM|MYBS|South Bimini||BS|25.6999|-79.2647|10|138|1
BIQ|LFBZ|Biarritz Pays Basque airport||FR|43.4684|-1.5232|245|309|1
BIR|VNVT|Biratnagar||NP|26.4815|87.264|236|214|1
BIS|KBIS|Bismarck||US|46.7727|-100.747|1661|87|1
BJB|OIMN|Bojnord||IR|37.493|57.3082|3499|247|1
BJC|KBJC|Rocky Mountain|Denver|US|39.9088|-105.117|5673|95|1
BJF|ENBS|Båtsfjord||NO|70.6003|29.6926|490|308|1
BJR|HABD|Bahir Dar||ET|11.6081|37.3216|5978|3|1
BJZ|LEBZ|Badajoz||ES|38.8913|-6.8213|609|303|1
BKG|KBBG|Branson||US|36.5321|-93.2005|1302|87|1
BKN|UTAN|Balkanabat||TM|39.6811|54.206|-26|185|1
BKQ|YBCK|Blackall||AU|-24.4317|145.43|928|269|1
BKS|WIGG|Fatmawati Soekarno|Bengkulu|ID|-3.8637|102.339|50|208|1
BKW|KBKW|Raleigh County Memorial|Beaver|US|37.7873|-81.1242|2504|139|1
BLD|KBVU|Boulder City||US|35.9472|-114.859|2201|122|1
BLE|ESSD|Dala|Borlange|SE|60.422|15.5152|503|320|1
BLI|KBLI|Bellingham||US|48.7928|-122.538|170|122|1
BLV|KBLV|Scott AFB/Midamerica|Belleville|US|38.5452|-89.8352|459|87|1
BMA|ESSB|Stockholm-Bromma||SE|59.3544|17.9417|47|320|1
BMI|KBMI|Central Illinois Regional Airport at Bloomington-Normal|Bloomington/Normal|US|40.4771|-88.9159|871|87|1
BMU|WADB|Sultan Muhammad Salahuddin|Bima|ID|-8.5372|118.685|3|223|1
BMV|VVBM|Buon Ma Thuot||VN|12.6683|108.12|1729|204|1
BMW|DATM|Bordj Badji Mokhtar||DZ|21.3778|0.927|1303|4|1
BNI|DNBE|Benin||NG|6.317|5.5995|258|30|1
BNK|YBNA|Ballina Byron Gateway||AU|-28.8332|153.561|7|277|1
BNN|ENBN|Brønnøysund Airport, Brønnøy||NO|65.4611|12.2175|25|308|1
BNS|SVBI|Barinas||VE|8.615|-70.2142|615|84|1
BOB|NTTB|Bora Bora|Motu Mute|PF|-16.4444|-151.751|10|368|1
BOC|MPBO|Bocas del Toro Isla Colón||PA|9.3408|-82.2508|10|143|1
BOH|EGHH|Bournemouth||GB|50.7805|-1.8396|38|301|1
BOR|VLBK|Bokeo|Ton Phueng|LA|20.324|100.165|1175|309|1
BPE|ZBDH|Qinhuangdao Beidaihe|Qinhuangdao (Changli)|CN|39.6664|119.061|46|0|1
BPL|ZWBL|Bole Alashankou||CN|44.8955|82.3001|1253|241|1
BPT|KBPT|Jack Brooks|Beaumont/Port Arthur|US|29.9508|-94.0207|15|87|1
BPX|ZUBD|Qamdo Bangda||CN|30.5536|97.1083|14219|241|1
BPY|FMNQ|Besalampy||MG|-16.7445|44.4825|125|330|1
BQK|KBQK|Brunswick Golden Isles||US|31.2588|-81.4665|26|139|1
BQL|YBOU|Boulia||AU|-22.9133|139.9|542|269|1
BQN|TJBQ|Rafael Hernández|Aguadilla|PR|18.4949|-67.1294|237|149|1
BQS|UHBB|Ignatyevo|Blagoveschensk|RU|50.4267|127.415|638|255|1
BQU|TVSB|J F Mitchell|Bequia|VC|12.9884|-61.262|15|167|1
BRD|KBRD|Brainerd Lakes||US|46.4029|-94.1297|1232|87|1
BRK|YBKE|Bourke||AU|-30.0392|145.952|352|277|1
BRL|KBRL|Southeast Iowa|Burlington|US|40.7832|-91.1255|698|87|1
BRN|LSZB|Bern||CH|46.9127|7.4988|1671|329|1
BRO|KBRO|Brownsville South Padre Island||US|25.9072|-97.4252|22|87|1
BRQ|LKTB|Brno-Tuřany||CZ|49.1513|16.694|778|311|1
BRR|EGPR|Barra|Eoligarry|GB|57.0228|-7.4431|5|301|1
BRW|PABR|Wiley Post Will Rogers Memorial|Utqiaġvik|US|71.2854|-156.766|44|53|1
BRX|MDBH|Maria Montez|Barahona|DO|18.2515|-71.1204|10|158|1
BSC|SKBS|José Celestino Mutis|Bahía Solano|CO|6.2029|-77.3947|80|79|1
BSD|ZPBS|Baoshan Yunrui|Baoshan (Longyang)|CN|25.0533|99.1683|5453|241|1
BSO|RPUO|Basco||PH|20.4513|121.98|291|224|1
BTC|VCCB|Batticaloa||LK|7.7051|81.6772|20|197|1
BTI|PABA|Barter Island Long Range Radar Station||US|70.134|-143.582|2|53|1
BTK|UIBB|Bratsk||RU|56.3696|101.702|1610|207|1
BTM|KBTM|Bert Mooney|Butte|US|45.9548|-112.497|5550|95|1
BTR|KBTR|Baton Rouge||US|30.5332|-91.1496|70|87|1
BTU|WBGB|Bintulu||MY|3.1239|113.02|74|219|1
BTV|KBTV|Patrick Leahy Burlington||US|44.4719|-73.1533|335|139|1
BUA|AYBK|Buka|Buka Island|PG|-5.4223|154.673|11|341|1
BUN|SKBU|Gerardo Tobar López|Buenaventura|CO|3.8196|-76.9898|48|79|1
BUX|FZKA|Bunia||CD|1.5657|30.2207|4045|34|1
BUZ|OIBB|Bushehr||IR|28.9448|50.8346|68|247|1
BVE|LFSL|Brive Souillac airport||FR|45.0397|1.4856|1016|309|1
BVG|ENBV|Berlevåg||NO|70.8715|29.0341|42|308|1
BVH|SBVH|Brigadeiro Camarão|Vilhena|BR|-12.6944|-60.0983|2018|148|1
BVI|YBDV|Birdsville||AU|-25.8975|139.348|159|269|1
BVJ|USDB|Bovanenkovo||RU|70.3153|68.3336|24|257|1
BWK|LDSB|Brač|Gornji Humac|HR|43.2845|16.6784|1776|328|1
BWO|UWSB|Balakovo||RU|51.8583|47.7456|95|316|1
BWT|YWYY|Wynyard|Burnie|AU|-40.997|145.726|62|272|1
BXH|UAAH|Balkhash||KZ|46.8942|75.0045|1446|180|1
BXR|OIKM|Bam||IR|29.0842|58.45|3231|247|1
BXU|RPME|Bancasi|Butuan|PH|8.9515|125.479|141|224|1
BYK|DIBK|Bouaké||CI|7.7388|-5.0737|1230|1|1
BYM|MUBY|Carlos Manuel de Cespedes|Bayamo|CU|20.3964|-76.6214|203|111|1
BYN|ZMBH|Bayankhongor||MN|46.1633|100.704|6085|251|1
BZG|EPBY|Ignacy Jan Paderewski Bydgoszcz||PL|53.0968|17.9777|235|327|1
BZI|LTBF|Balıkesir||TR|39.6193|27.926|340|294|1
BZK|UUBP|Bryansk||RU|53.2144|34.176|663|307|1
BZL|VGBR|Barisal||BD|22.801|90.3012|23|199|1
BZN|KBZN|Bozeman Yellowstone||US|45.7789|-111.154|4473|95|1
BZO|LIPB|Bolzano|Bolzano (BZ)|IT|46.4592|11.3261|789|313|1
BZR|LFMU|Béziers Vias airport||FR|43.3235|3.3539|56|309|1
BZX|ZUBZ|Bazhong Enyang||CN|31.7384|106.645|1804|241|1
CAB|FNCA|Cabinda||AO|-5.5984|12.1881|66|33|1
CAC|SBCA|Coronel Adalberto Mendes da Silva|Cascavel|BR|-25.0003|-53.5012|2481|159|1
CAE|KCAE|Columbia||US|33.9382|-81.123|236|139|1
CAH|VVCM|Cà Mau|Ca Mau City|VN|9.1777|105.178|6|204|1
CAJ|SVCN|Canaima||VE|6.232|-62.8548|1450|84|1
CAK|KCAK|Akron Canton||US|40.9161|-81.4422|1228|139|1
CAL|EGEC|Campbeltown||GB|55.4372|-5.6864|42|301|1
CAT|LPCS|Cascais||PT|38.725|-9.3552|325|299|1
CAW|SBCP|Bartolomeu Lisandro|Campos dos Goytacazes|BR|-21.6983|-41.3017|59|159|1
CAZ|YCBA|Cobar||AU|-31.5383|145.794|724|277|1
CBH|DAOR|Béchar Boudghene Ben Ali Lotfi||DZ|31.6457|-2.2699|2661|4|1
CBO|RPMC|Cotabato (Awang)|Datu Odin Sinsuat|PH|7.1648|124.21|189|224|1
CBQ|DNCA|Margaret Ekpo|Calabar|NG|4.976|8.3472|210|30|1
CBR|YSCB|Canberra||AU|-35.3069|149.195|1886|277|1
CBT|FNCT|Catumbela||AO|-12.4792|13.4869|23|33|1
CCC|MUCC|Jardines Del Rey|Cayo Coco|CU|22.461|-78.3284|13|111|1
CCE|HECP|Capital|New Cairo|EG|30.0647|31.84|761|13|1
CCF|LFMK|Carcassonne Salvaza||FR|43.216|2.3063|433|309|1
CCR|KCCR|Buchanan Field|Concord|US|37.9897|-122.057|26|122|1
CCZ|MYBC|Chub Cay||BS|25.4171|-77.8809|5|138|1
CDB|PACD|Cold Bay||US|55.2079|-162.725|96|140|1
CDC|KCDC|Cedar City||US|37.701|-113.099|5622|95|1
CDE|ZBCD|Chengde Puning||CN|41.1225|118.074|0|241|1
CDP|VOCP|Kadapa||IN|14.5132|78.7692|430|216|1
CDR|KCDR|Chadron||US|42.8376|-103.095|3297|95|1
CDT|LECH|Castellón-Costa Azahar|Castellón de la Plana|ES|40.2139|0.0733|1182|303|1
CDV|PACV|Merle K (Mudhole) Smith|Cordova|US|60.4918|-145.478|54|53|1
CEC|KCEC|Jack Mc Namara Field|Crescent City|US|41.7789|-124.236|61|122|1
CED|YCDU|Ceduna||AU|-32.1306|133.71|77|268|1
CEE|ULWC|Cherepovets||RU|59.2736|38.0158|377|307|1
CEN|MMCN|Ciudad Obregón||MX|27.3926|-109.833|243|112|1
CEZ|KCEZ|Cortez||US|37.303|-108.628|5918|95|1
CFG|MUCF|Jaime Gonzalez|Cienfuegos|CU|22.15|-80.4142|102|111|1
CFN|EIDL|Donegal||IE|55.0442|-8.341|30|289|1
CFR|LFRK|Caen Carpiquet airport||FR|49.1768|-0.4549|256|309|1
CFS|YCFS|Coffs Harbour||AU|-30.3206|153.116|18|277|1
CGD|ZGCD|Changde Taohuayuan|Changde (Dingcheng)|CN|28.9189|111.64|128|241|1
CGI|KCGI|Cape Girardeau||US|37.2253|-89.5708|342|87|1
CGM|RPMH|Camiguin|Mambajao|PH|9.2539|124.709|53|224|1
CGR|SBCG|Campo Grande||BR|-20.47|-54.674|1833|82|1
CHA|KCHA|Chattanooga Metropolitan Airport (Lovell Field)||US|35.0353|-85.2038|683|139|1
CHG|ZYCY|Chaoyang|Shuangta, Chaoyang|CN|41.5381|120.435|568|241|1
CHH|SPPY|Chachapoyas||PE|-6.2019|-77.8562|8333|121|1
CHM|SPEO|FAP Lieutenant Jaime Andres de Montreuil Morales|Chimbote|PE|-9.1496|-78.5238|69|121|1
CHO|KCHO|Charlottesville Albemarle||US|38.1386|-78.4529|639|139|1
CHT|NZCI|Inia William Tuuta Memorial|Te One|NZ|-43.8119|-176.465|43|342|1
CHX|MPCH|Changuinola Captain Manuel Niño||PA|9.459|-82.5151|19|143|1
CID|KCID|The Eastern Iowa|Cedar Rapids|US|41.8847|-91.7108|869|87|1
CIF|ZBCF|Chifeng Yulong||CN|42.1597|118.841|2018|241|1
CIJ|SLCO|Capitán Aníbal Arab|Cobija|BO|-11.0391|-68.7828|889|120|1
CIU|KCIU|Chippewa County|Kincheloe|US|46.242|-84.4621|800|96|1
CIW|TVSC|Canouan||VC|12.699|-61.3424|11|167|1
CIY|LICB|Comiso||IT|36.9958|14.6089|756|313|1
CJA|SPJR|Mayor General FAP Armando Revoredo Iglesias|Cajamarca|PE|-7.1392|-78.4894|8781|121|1
CJC|SCCF|El Loa|Calama|CL|-22.4982|-68.9036|7543|157|1
CJL|OPCH|Chitral||PK|35.8862|71.7999|4920|213|1
CJM|VTSE|Chumphon||TH|10.7112|99.3617|18|190|1
CKB|KCKB|North Central West Virginia|Bridgeport|US|39.2966|-80.2281|1217|139|1
CKH|UESO|Chokurdakh|Chokurdah|RU|70.6231|147.902|151|243|1
CKS|SBCJ|Carajás|Parauapebas|BR|-6.1178|-50.0034|2064|75|1
CKZ|LTBH|Çanakkale||TR|40.1377|26.4268|23|294|1
CLD|KCRQ|McClellan-Palomar|Carlsbad|US|33.1283|-117.28|331|122|1
CLL|KCLL|Easterwood Field|College Station|US|30.5886|-96.3638|320|87|1
CLQ|MMIA|Licenciado Miguel de la Madrid|Colima|MX|19.277|-103.577|2467|132|1
CLY|LFKC|Calvi Sainte Catherine||FR|42.5304|8.793|209|309|1
CMA|YCMU|Cunnamulla||AU|-28.03|145.622|630|269|1
CME|MMCE|Ciudad del Carmen||MX|18.6515|-91.7994|10|131|1
CMF|LFLB|Chambéry Aix les Bains airport||FR|45.6381|5.8802|779|309|1
CMG|SBCR|Corumbá||BR|-19.0119|-57.6728|463|82|1
CMI|KCMI|University of Illinois Willard|Savoy|US|40.0398|-88.2762|755|87|1
CMU|AYCH|Chimbu|Kundiawa|PG|-6.0243|144.971|4974|365|1
CMX|KCMX|Houghton County Memorial|Hancock|US|47.1684|-88.4891|1095|96|1
CNB|YCNM|Coonamble||AU|-30.9809|148.378|604|277|1
CNJ|YCCY|Cloncurry||AU|-20.6686|140.504|616|269|1
CNM|KCNM|Cavern City|Carlsbad|US|32.3375|-104.263|3295|95|1
CNP|BGCO|Neerlerit Inaat||GL|70.7431|-22.6505|45|160|1
CNQ|SARC|Corrientes||AR|-27.4455|-58.7619|202|59|1
CNY|KCNY|Canyonlands|Moab|US|38.755|-109.755|4557|95|1
COD|KCOD|Yellowstone|Cody|US|44.5202|-109.024|5102|95|1
COQ|ZMCD|Choibalsan||MN|48.1354|114.647|2457|196|1
COU|KCOU|Columbia||US|38.8181|-92.2196|889|87|1
CPC|SAZY|Aviador C. Campos|Chapelco/San Martin de los Andes|AR|-40.0754|-71.1373|2569|64|1
CPD|YCBP|Coober Pedy||AU|-29.0383|134.722|740|268|1
CPE|MMCP|Ingeniero Alberto Acuña Ongay|Campeche|MX|19.816|-90.5001|34|131|1
CPO|SCAT|Desierto de Atacama|Copiapo|CL|-27.2612|-70.7792|670|157|1
CPR|KCPR|Casper-Natrona County||US|42.9074|-106.462|5350|95|1
CPV|SBKG|Presidente João Suassuna|Campina Grande|BR|-7.2697|-35.8961|1646|101|1
CPX|TJCP|Benjamin Rivera Noriega|Culebra|PR|18.313|-65.3039|49|149|1
CQW|ZUWL|Chongqing Xiannüshan|Wulong|CN|29.4657|107.694|1747|241|1
CRI|MYCI|Colonel Hill||BS|22.7456|-74.1824|5|138|1
CRM|RPVF|Catarman||PH|12.5016|124.635|6|224|1
CRP|KCRP|Corpus Christi||US|27.7704|-97.5012|44|87|1
CRV|LIBC|Crotone Sant'Anna Pythagoras|Isola di Capo Rizzuto (KR)|IT|38.9972|17.0802|522|313|1
CRW|KCRW|Yeager|Charleston|US|38.3731|-81.5932|981|139|1
CSG|KCSG|Columbus||US|32.5164|-84.9396|397|139|1
CSK|GOGS|Cap Skirring||SN|12.3953|-16.748|52|16|1
CSW|MMSL|Cabo San Lucas||MX|22.9491|-109.939|459|129|1
CSY|UWKS|Cheboksary||RU|56.0903|47.3473|558|307|1
CTC|SANC|Coronel Felipe Varela|Catamarca|AR|-28.5931|-65.7512|1522|58|1
CTD|MPCE|Alonso Valderrama|Chitré|PA|7.9878|-80.4098|33|143|1
CTL|YBCV|Charleville||AU|-26.4133|146.262|1003|269|1
CTM|MMCM|Chetumal||MX|18.505|-88.328|39|83|1
CTN|YCKN|Cooktown||AU|-15.4436|145.183|26|269|1
CUC|SKCC|Camilo Daza|Cúcuta|CO|7.9276|-72.5115|1096|79|1
CUE|SECU|Mariscal Lamar|Cuenca|EC|-2.8895|-78.9844|8306|108|1
CUF|LIMZ|Cuneo|Levaldigi (CN)|IT|44.5475|7.623|1267|313|1
CUK|MZCK|Caye Caulker||BZ|17.735|-88.0329|2|0|1
CUM|SVCU|Antonio José de Sucre|Cumaná|VE|10.4503|-64.1305|14|84|1
CUP|SVCP|General Francisco Bermúdez|Carúpano|VE|10.66|-63.2617|33|84|1
CUQ|YCOE|Coen||AU|-13.7611|143.113|532|269|1
CVM|MMCV|General Pedro Jose Mendez|Ciudad Victoria|MX|23.7033|-98.9565|761|135|1
CVN|KCVN|Clovis||US|34.4266|-103.079|4216|95|1
CVQ|YCAR|Carnarvon||AU|-24.8843|113.666|13|276|1
CWA|KCWA|Central Wisconsin|Mosinee|US|44.7774|-89.6702|1277|87|1
CWC|UKLN|Chernivtsi||UA|48.2593|25.9808|826|298|1
CWJ|ZPCW|Cangyuan Washan|Lincang (Cangyuan)|CN|23.2763|99.3732|0|0|1
CXB|VGCB|Cox's Bazar||BD|21.4575|91.9633|12|199|1
CXJ|SBCX|Hugo Cantergiani|Caxias Do Sul|BR|-29.1972|-51.1876|2472|159|1
CXP|WAHL|Tunggul Wulung|Cilacap|ID|-7.6451|109.034|69|208|1
CYA|MTCA|Antoine-Simon|Les Cayes|HT|18.2711|-73.7883|203|146|1
CYB|MWCB|Charles Kirkconnell|West End|KY|19.687|-79.8828|8|86|1
CYC|MZCP|Caye Chapel||BZ|17.6838|-88.045|3|0|1
CYI|RCKU|Chiayi|Shuishang|TW|23.4626|120.391|85|244|1
CYO|MUCL|Vilo Acuña|Cayo Largo del Sur|CU|21.6165|-81.546|10|111|1
CYP|RPVC|Calbayog|Calbayog City|PH|12.0726|124.545|12|224|1
CYS|KCYS|Cheyenne Regional Jerry Olson Field||US|41.1557|-104.812|6159|95|1
CYX|UESS|Cherskiy||RU|68.7406|161.338|20|243|1
CYZ|RPUY|Cauayan|Cauayan City|PH|16.9299|121.753|200|224|1
CZE|SVCR|José Leonardo Chirinos|Coro|VE|11.4149|-69.6809|52|84|1
CZH|MZCZ|Corozal||BZ|18.3822|-88.4119|40|0|1
CZS|SBCZ|Cruzeiro do Sul||BR|-7.5999|-72.7695|637|155|1
CZU|SKCZ|Las Brujas|Corozal|CO|9.3327|-75.2856|528|79|1
CZX|ZSCG|Changzhou Benniu||CN|31.9205|119.775|33|241|1
DAB|KDAB|Daytona Beach||US|29.1825|-81.0595|34|139|1
DAU|AYDU|Daru||PG|-9.0868|143.208|20|365|1
DAV|MPDA|Enrique Malek|David|PA|8.389|-82.4364|89|143|1
DAY|KDAY|James M. Cox Dayton||US|39.9024|-84.2194|1009|139|1
DBC|ZYBA|Baicheng Chang'an||CN|45.5053|123.02|480|0|1
DBO|YSDU|Dubbo City||AU|-32.2167|148.575|935|277|1
DBQ|KDBQ|Dubuque||US|42.402|-90.7095|1077|87|1
DBR|VEDH|Darbhanga||IN|26.1928|85.9169|156|216|1
DCF|TDCF|Canefield||DM|15.3367|-61.3921|13|97|1
DCM|LFCK|Castres Mazamet||FR|43.5563|2.2892|788|309|1
DCY|ZUDC|Daocheng Yading|Garzê (Daocheng)|CN|29.3163|100.06|14472|241|1
DDC|KDDC|Dodge City||US|37.7634|-99.9656|2594|87|1
DDG|ZYDD|Dandong Langtou|Dandong (Zhenxing)|CN|40.0255|124.287|30|241|1
DDR|ZUDR|Shigatse Tingri|Xigazê (Dingri)|CN|28.6046|86.798|14108|241|1
DEA|OPDG|Dera Ghazi Khan||PK|29.961|70.4859|492|213|1
DEC|KDEC|Decatur||US|39.8346|-88.8657|682|87|1
DED|VIDN|Dehradun Jolly Grant|Dehradun (Jauligrant)|IN|30.1892|78.1767|1831|216|1
DEF|OIAD|Dezful||IR|32.4344|48.3976|474|247|1
DGA|MZPB|Dangriga||BZ|16.9825|-88.231|10|76|1
DGO|MMDO|General Guadalupe Victoria|Durango|MX|24.1255|-104.528|6104|135|1
DGT|RPVD|Sibulan|Dumaguete City|PH|9.3342|123.302|15|224|1
DHM|VIGG|Kangra||IN|32.1649|76.263|2525|216|1
DHN|KDHN|Dothan||US|31.3213|-85.4496|401|87|1
DHX|WARD|Dhoho|Kediri|ID|-7.7495|111.947|380|0|1
DIB|VEMN|Dibrugarh||IN|27.4839|95.0169|362|216|1
DIE|FMNA|Arrachart|Antisiranana|MG|-12.3494|49.2917|374|330|1
DIG|ZPDQ|Diqing Shangri-La|Diqing (Shangri-La)|CN|27.7936|99.6772|10761|241|1
DIJ|LFSD|Dijon Longvic airport||FR|47.2689|5.09|726|309|1
DIK|KDIK|Dickinson Theodore Roosevelt||US|46.7975|-102.802|2592|95|1
DIN|VVDB|Dien Bien Phu||VN|21.3975|103.008|1611|190|1
DIY|LTCC|Diyarbakır||TR|37.8939|40.201|2251|294|1
DKA|DNKT|Umaru Musa Yar'adua|Katsina|NG|13.0078|7.6604|1660|0|1
DLE|LFGJ|Dole Tavaux||FR|47.039|5.4276|645|309|1
DLG|PADL|Dillingham||US|59.0447|-158.505|81|53|1
DLH|KDLH|Duluth||US|46.8419|-92.1987|1428|87|1
DLI|VVDL|Lien Khuong|Da Lat|VN|11.7506|108.367|3156|204|1
DLU|ZPDL|Dali Fengyi|Dali (Xiaguan)|CN|25.6494|100.319|7050|241|1
DLZ|ZMDZ|Dalanzadgad||MN|43.6086|104.368|4787|251|1
DMU|VEMR|Dimapur||IN|25.8839|93.7711|487|216|1
DND|EGPN|Dundee||GB|56.4525|-3.0258|17|301|1
DNK|UKDD|Dnipro||UA|48.3572|35.1006|481|298|1
DNR|LFRD|Dinard Pleurtuit Saint-Malo airport||FR|48.5877|-2.08|219|309|1
DNZ|LTAY|Çardak|Denizli|TR|37.7856|29.7013|2795|294|1
DOD|HTDO|Dodoma||TZ|-6.1706|35.756|3673|17|1
DOG|HSDN|Dongola||SD|19.1537|30.4301|772|27|1
DOL|LFRG|Deauville Normandie airport||FR|49.3652|0.1545|479|309|1
DOM|TDPD|Douglas-Charles|Marigot|DM|15.5467|-61.3011|73|97|1
DOV|KDOV|Dover Civil Air Terminal/Dover Air Force Base||US|39.1295|-75.466|24|139|1
DOY|ZSDY|Dongying Shengli|Dongying (Kenli)|CN|37.5014|118.79|15|241|1
DPL|RPMG|Dipolog||PH|8.602|123.342|12|224|1
DPO|YDPO|Devonport||AU|-41.1697|146.43|33|272|1
DRG|PADE|Deering||US|66.0689|-162.767|21|140|1
DRO|KDRO|Durango La Plata||US|37.1515|-107.754|6685|95|1
DSI|KDTS|Destin Executive||US|30.4001|-86.4715|23|87|1
DSO|ZKSD|Sondok|Sŏndŏng-ni|KP|39.7452|127.474|12|233|1
DTU|ZYDU|Wudalianchi Dedu|Heihe|CN|48.441|126.128|984|0|1
DUD|NZDN|Dunedin||NZ|-45.929|170.198|4|340|1
DUE|FNDU|Dundo|Chitato|AO|-7.4009|20.8185|2451|33|1
DUJ|KDUJ|DuBois||US|41.1783|-78.8987|1817|139|1
DUM|WIBD|Pinang Kampai|Dumai|ID|1.609|101.433|55|208|1
DUT|PADU|Tom Madsen (Dutch Harbor)|Unalaska|US|53.8988|-166.545|22|140|1
DVL|KDVL|Devils Lake||US|48.1155|-98.9088|1456|87|1
DWD|OEDM|Dawadmi||SA|24.4499|44.1212|3026|237|1
DYR|UHMA|Ugolny Yuri Ryktheu|Anadyr|RU|64.7349|177.741|194|182|1
DZH|ZUDA|Dazhou Jinya|Dazhou (Dachuan)|CN|31.0488|107.436|1342|241|1
EAM|OENG|Najran||SA|17.6114|44.4192|3982|237|1
EAR|KEAR|Kearney||US|40.727|-99.0068|2131|87|1
EAS|LESO|San Sebastián|Hondarribia|ES|43.3565|-1.7906|16|303|1
EAT|KEAT|Pangborn Memorial|Wenatchee|US|47.3989|-120.207|1249|122|1
EAU|KEAU|Chippewa Valley|Eau Claire|US|44.8658|-91.4843|913|87|1
EBA|LIRJ|Marina di Campo|Campo nell'Elba (LI)|IT|42.7609|10.2398|31|313|1
EBD|HSOB|El-Obeid||SD|13.1532|30.2327|1927|27|1
EBJ|EKEB|Esbjerg||DK|55.5259|8.5534|97|288|1
ECP|KECP|Northwest Florida Beaches|Panama City Beach|US|30.3571|-85.7954|69|87|1
EFL|LGKF|Kefallinia|Kefallinia Island|GR|38.1201|20.5005|59|280|1
EGC|LFBE|Bergerac Dordogne-Périgord airport||FR|44.8253|0.5186|171|309|1
EGE|KEGE|Eagle County||US|39.6426|-106.918|6548|95|1
EGO|UUOB|Belgorod||RU|50.6438|36.5901|735|307|1
EGS|BIEG|Egilsstaðir||IS|65.2833|-14.4014|76|265|1
EGX|PAII|Egegik||US|58.1844|-157.375|92|53|1
EIE|UNII|Yeniseysk||RU|58.4742|92.1125|253|217|1
EJA|SKEJ|Yariguíes|Barrancabermeja|CO|7.0243|-73.8068|412|79|1
EJH|OEWJ|Al Wajh||SA|26.1986|36.4764|66|237|1
EKO|KEKO|Elko||US|40.8249|-115.792|5140|122|1
ELC|YELD|Elcho Island||AU|-12.0194|135.571|101|271|1
ELD|KELD|South Arkansas Regional Airport at Goodwin Field|El Dorado|US|33.221|-92.8133|277|87|1
ELF|HSFS|El Fasher||SD|13.6149|25.3246|2393|27|1
ELG|DAUE|El Golea|El Menia|DZ|30.5807|2.8616|1306|4|1
ELH|MYEH|North Eleuthera||BS|25.4758|-76.6808|13|138|1
ELM|KELM|Elmira Corning|Elmira/Corning|US|42.1599|-76.8916|954|139|1
ELU|DAUO|Guemar Airport - مطار قمار بالوادي||DZ|33.5114|6.7768|203|4|1
EMD|YEML|Emerald||AU|-23.5675|148.179|624|269|1
EMK|PAEM|Emmonak||US|62.7861|-164.491|13|140|1
ENA|PAEN|Kenai||US|60.5709|-151.245|99|53|1
ENF|EFET|Enontekio||FI|68.3626|23.4243|1005|292|1
ENH|ZHES|Enshi Xujiaping|Enshi (Enshi)|CN|30.3203|109.485|1605|241|1
ENY|ZLYA|Yan'an Nanniwan|Yan'an (Baota)|CN|36.4794|109.464|0|241|1
EOH|SKMD|Enrique Olaya Herrera|Medellín|CO|6.2197|-75.5906|4949|79|1
EOI|EGED|Eday||GB|59.1906|-2.7722|10|301|1
EPR|YESP|Esperance||AU|-33.6844|121.823|470|276|1
EPU|EEPU|Pärnu||EE|58.419|24.4728|47|321|1
EQS|SAVE|Esquel Brigadier Antonio Parodi||AR|-42.908|-71.1395|2621|58|1
ERC|LTCD|Erzincan||TR|39.7102|39.527|3783|294|1
ERH|GMFK|Moulay Ali Cherif|Errachidia|MA|31.9475|-4.3983|3428|14|1
ERI|KERI|Erie International Tom Ridge Field||US|42.0831|-80.1739|732|139|1
ERL|ZBER|Erenhot Saiwusu||CN|43.4241|112.091|3301|241|1
ERS|FYWE|Eros|Windhoek|NA|-22.6049|17.079|5575|51|1
ERZ|LTCE|Erzurum||TR|39.9565|41.1702|5763|294|1
ESC|KESC|Delta|Escanaba|US|45.7232|-87.0886|609|96|1
ESD|KORS|Orcas Island|Eastsound|US|48.7082|-122.91|31|122|1
ESL|URWI|Elista||RU|46.3739|44.3309|501|307|1
ESR|SCES|Ricardo García Posada|El Salvador|CL|-26.3111|-69.7652|5240|157|1
ESU|GMMI|Essaouira-Mogador||MA|31.3975|-9.6817|384|14|1
ETR|SERO|Santa Rosa - Artillery Colonel Victor Larrea||EC|-3.442|-79.997|20|108|1
ETZ|LFJL|Metz-Nancy-Lorraine|Goin|FR|48.9821|6.2513|870|309|1
EUG|KEUG|Eugene||US|44.1246|-123.212|374|122|1
EUX|TNCE|F. D. Roosevelt|Oranjestad|BQ|17.4965|-62.9794|129|119|1
EVV|KEVV|Evansville||US|38.037|-87.5324|418|87|1
EWB|KEWB|New Bedford||US|41.6761|-70.9569|80|139|1
EWN|KEWN|Coastal Carolina|New Bern|US|35.073|-77.0429|18|139|1
EXT|EGTE|Exeter|Exeter, Devon|GB|50.7343|-3.414|102|301|1
EYK|USHQ|Beloyarskiy||RU|63.6869|66.6986|82|0|1
EYP|SKYP|El Alcaravan - Yopal||CO|5.3191|-72.384|1028|79|1
EYW|KEYW|Key West||US|24.5561|-81.7596|3|139|1
EZS|LTCA|Elazığ||TR|38.598|39.2835|2927|294|1
FAI|PAFA|Fairbanks||US|64.8151|-147.856|439|53|1
FAR|KFAR|Hector|Fargo|US|46.9207|-96.8158|902|87|1
FAV|NTGF|Fakarava||PF|-16.0541|-145.657|13|368|1
FAY|KFAY|Fayetteville Regional Airport - Grannis Field||US|34.9912|-78.8803|189|139|1
FCA|KGPI|Glacier Park|Kalispell|US|48.3105|-114.256|2977|95|1
FCN|ETMN|Sea-Airport Cuxhaven/Nordholz / Nordholz Naval|Wurster Nordseeküste|DE|53.7677|8.6592|74|282|1
FDU|FZBO|Bandundu||CD|-3.3113|17.3817|1063|29|1
FEG|UZFF|Fergana||UZ|40.3588|71.745|1980|245|1
FEN|SBFN|Fernando de Noronha||BR|-3.8545|-32.423|193|141|1
FGU|NTGB|Fangatau||PF|-15.82|-140.888|9|368|1
FIZ|YFTZ|Fitzroy Crossing||AU|-18.1836|125.56|368|276|1
FKQ|WASF|Fakfak||ID|-2.9205|132.267|462|209|1
FKS|RJSF|Fukushima|Sukagawa|JP|37.2274|140.431|1221|249|1
FLA|SKFL|Gustavo Artunduaga Paredes|Florencia|CO|1.5892|-75.5644|803|79|1
FLG|KFLG|Flagstaff Pulliam||US|35.1398|-111.67|7014|145|1
FLO|KFLO|Florence||US|34.1854|-79.7239|146|139|1
FLW|LPFL|Flores|Santa Cruz das Flores|PT|39.4553|-31.1314|112|259|1
FLZ|WIMS|Dr. Ferdinand Lumban Tobing|Sibolga (Pinangsori)|ID|1.5571|98.8871|33|208|1
FMA|SARF|Formosa||AR|-26.2127|-58.2281|193|59|1
FMI|FZRF|Kalemie||CD|-5.8756|29.25|2569|34|1
FNI|LFTW|Nîmes-Arles-Camargue|Nîmes/Garons|FR|43.7574|4.4164|309|309|1
FNT|KFNT|Bishop|Flint|US|42.9693|-83.7434|782|96|1
FOD|KFOD|Fort Dodge||US|42.5526|-94.1912|1156|87|1
FOG|LIBF|Foggia Gino Lisa|Foggia (FG)|IT|41.4336|15.5346|265|313|1
FON|MRAN|La Fortuna Arenal||CR|10.4693|-84.5791|342|90|1
FRD|KFHR|Friday Harbor||US|48.5237|-123.025|113|122|1
FRL|LIPK|Forlì-Luigi Ridolfi|Forlì (FC)|IT|44.1948|12.0701|97|313|1
FRO|ENFL|Florø||NO|61.5836|5.0247|37|308|1
FRS|MGMM|Mundo Maya|San Benito|GT|16.9137|-89.8661|427|76|1
FSD|KFSD|Sioux Falls||US|43.5855|-96.7412|1429|87|1
FSM|KFSM|Fort Smith||US|35.3366|-94.3674|469|87|1
FSP|LFVP|Saint-Pierre Pointe-Blanche||PM|46.7627|-56.175|27|133|1
FTE|SAWC|El Calafate - Commander Armando Tola||AR|-50.2803|-72.0534|669|63|1
FTU|FMSD|Tôlanaro||MG|-25.0381|46.9561|29|330|1
FTW|KFTW|Fort Worth Meacham||US|32.8199|-97.3608|710|87|1
FUG|ZSFY|Fuyang Xiguan|Yingzhou, Fuyang|CN|32.8822|115.734|104|241|1
FUJ|RJFE|Fukue|Goto|JP|32.6663|128.833|273|249|1
FUN|NGFU|Funafuti||TV|-8.5239|179.197|9|347|1
FUO|ZGFS|Foshan Shadi|Foshan (Nanhai)|CN|23.0825|113.071|6|241|1
FWA|KFWA|Fort Wayne||US|40.9789|-85.1945|814|113|1
FYJ|ZYFY|Fuyuan Dongji||CN|48.1972|134.363|0|0|1
FYN|ZWFY|Fuyun Koktokay||CN|46.8042|89.512|3081|0|1
FYU|PFYU|Fort Yukon||US|66.5717|-145.25|433|53|1
GAJ|RJSC|Yamagata|Higashine|JP|38.4119|140.371|353|249|1
GAL|PAGA|Edward G. Pitka Sr|Galena|US|64.7362|-156.937|153|53|1
GAM|PAGM|Gambell||US|63.7677|-171.733|27|140|1
GAQ|GAGO|Gao||ML|16.2485|-0.0054|870|6|1
GAY|VEGY|Gaya||IN|24.7443|84.9512|380|216|1
GBB|UBBQ|Gabala||AZ|40.8086|47.7254|935|189|1
GBJ|TFFM|Marie-Galante|Grand-Bourg|GP|15.8689|-61.2701|16|106|1
GCC|KGCC|Northeast Wyoming|Gillette|US|44.3489|-105.539|4365|95|1
GCH|OIAH|Gachsaran||IR|30.3339|50.8338|2414|247|1
GCI|EGJB|Guernsey|Saint Peter Port|GG|49.435|-2.602|336|291|1
GCK|KGCK|Garden City||US|37.9275|-100.724|2891|87|1
GCN|KGCN|Grand Canyon National Park|Grand Canyon - Tusayan|US|35.9524|-112.147|6609|145|1
GDB|VAGD|Gondia||IN|21.5268|80.2903|987|0|1
GDE|HAGO|Gode||ET|5.9351|43.5786|834|3|1
GDQ|HAGN|Gondar|Azezo|ET|12.5199|37.434|6449|3|1
GDT|MBGT|JAGS McCartney|Cockburn Town|TC|21.4445|-71.1423|13|104|1
GDV|KGDV|Dawson Community|Glendive|US|47.1377|-104.807|2458|95|1
GDX|UHMM|Sokol|Magadan|RU|59.911|150.72|574|222|1
GDZ|URKG|Gelendzhik||RU|44.5821|38.0125|98|307|1
GEA|NWWM|Nouméa Magenta||NC|-22.2577|166.473|10|361|1
GEL|SBNM|Santo Ângelo||BR|-28.2825|-54.1696|1056|159|1
GEM|FGMY|President Obiang Nguema|Mengomeyén|GQ|1.6764|11.0249|2165|0|1
GER|MUNG|Rafael Cabrera|Nueva Gerona|CU|21.8347|-82.7838|79|111|1
GET|YGEL|Geraldton|Moonyoonooka|AU|-28.7961|114.707|121|276|1
GEV|ESNG|Gällivare||SE|67.1324|20.8146|1027|320|1
GFF|YGTH|Griffith||AU|-34.2508|146.067|439|277|1
GFK|KGFK|Grand Forks||US|47.9493|-97.1761|845|87|1
GGG|KGGG|East Texas|Longview|US|32.384|-94.7115|365|87|1
GGT|MYEF|Exuma|Moss Town|BS|23.5626|-75.878|9|138|1
GGW|KGGW|Glasgow Valley County Airport Wokal Field||US|48.2125|-106.615|2296|95|1
GHA|DAUG|Noumérat - Moufdi Zakaria|El Atteuf|DZ|32.3841|3.7941|1512|4|1
GHB|MYEM|Governor's Harbour||BS|25.2847|-76.331|26|138|1
GID|HBBE|Gitega||BI|-3.4172|29.9113|5741|12|1
GIL|OPGT|Gilgit||PK|35.9188|74.3336|4796|213|1
GIS|NZGS|Gisborne||NZ|-38.6633|177.978|15|340|1
GIZ|OEGN|Jizan Regional Airport / King Abdullah bin Abdulaziz||SA|16.9011|42.5858|20|237|1
GJA|MHNJ|La Laguna|Guanaja|HN|16.4454|-85.9066|49|169|1
GJT|KGJT|Grand Junction||US|39.1267|-108.529|4858|95|1
GKA|AYGA|Goroka|Goronka|PG|-6.0817|145.392|5282|365|1
GKN|PAGK|Gulkana||US|62.1559|-145.455|1586|53|1
GLF|MRGF|Golfito||CR|8.654|-83.1822|49|90|1
GLH|KGLH|Mid Delta|Greenville|US|33.4829|-90.9856|131|87|1
GLT|YGLA|Gladstone||AU|-23.8698|151.225|64|269|1
GMA|FZFK|Gemena||CD|3.2354|19.7713|1378|29|1
GMB|HAGM|Gambela||ET|8.1288|34.5631|1614|3|1
GME|UMGG|Gomel||BY|52.527|31.0167|472|306|1
GMO|DNGO|Gombe Lawanti||NG|10.2989|10.9|1590|30|1
GMQ|ZLGL|Golog Maqên|Golog (Maqên)|CN|34.4181|100.301|12426|0|1
GMR|NTGJ|Totegegie||PF|-23.0799|-134.89|7|349|1
GNB|LFLS|Grenoble Alpes Isère||FR|45.3629|5.3294|1302|309|1
GNS|WIMB|Binaka|Gunungsitoli|ID|1.1663|97.7052|20|208|1
GNV|KGNV|Gainesville||US|29.6901|-82.2718|152|139|1
GOP|VEGK|Gorakhpur||IN|26.7397|83.4497|259|216|1
GOQ|ZLGM|Golmud||CN|36.4006|94.7861|9334|241|1
GOV|YPGV|Gove|Nhulunbuy|AU|-12.2694|136.818|192|271|1
GPA|LGRX|Patras Araxos Agamemnon||GR|38.1511|21.4256|46|280|1
GPI|SKGP|Guapi||CO|2.5701|-77.898|164|79|1
GPS|SEGS|Seymour Galapagos Ecological|Isla Baltra|EC|-0.4538|-90.2659|207|348|1
GPT|KGPT|Gulfport Biloxi||US|30.4056|-89.0698|28|87|1
GRB|KGRB|Austin Straubel|Green Bay|US|44.4835|-88.1308|695|87|1
GRI|KGRI|Central Nebraska|Grand Island|US|40.9675|-98.3096|1847|87|1
GRK|KGRK|Killeen Regional Airport / Robert Gray Army|Fort Cavazos|US|31.0672|-97.8289|1015|87|1
GRW|LPGR|Graciosa|Santa Cruz da Graciosa|PT|39.0922|-28.0298|86|259|1
GRX|LEGR|F.G.L. Airport Granada-Jaén||ES|37.1887|-3.7774|1860|303|1
GRY|BIGR|Grímsey|Grímsey/Sandvík|IS|66.5458|-18.0173|66|265|1
GSP|KGSP|Greenville-Spartanburg|Greenville/Greer/Spartanburg|US|34.8957|-82.2189|964|139|1
GST|PAGS|Gustavus||US|58.4253|-135.707|35|117|1
GTE|YGTE|Groote Eylandt||AU|-13.9724|136.459|53|271|1
GTF|KGTF|Great Falls||US|47.482|-111.371|3680|95|1
GTR|KGTR|Golden Triangle|Columbus/W Point/Starkville|US|33.4503|-88.5914|264|87|1
GUC|KGUC|Gunnison Crested Butte||US|38.5347|-106.935|7680|95|1
GUP|KGUP|Gallup||US|35.5117|-108.788|6472|95|1
GUR|AYGN|Gurney||PG|-10.3115|150.334|88|365|1
GVR|SBGV|Coronel Altino Machado|Governador Valadares|BR|-18.8959|-41.9829|561|159|1
GWL|VIGR|Gwalior||IN|26.2933|78.2278|617|216|1
GWT|EDXW|Westerland Sylt||DE|54.9132|8.3405|51|282|1
GXG|FNNG|Negage||AO|-7.7545|15.2877|4105|33|1
GXH|ZLXH|Gannan Xiahe|Gannan (Xiahe)|CN|34.819|102.622|10510|0|1
GYA|SLGM|Guayaramerín||BO|-10.8886|-65.381|456|120|1
GYM|MMGM|General José María Yáñez|Guaymas|MX|27.969|-110.925|59|112|1
GYS|ZUGU|Guangyuan Panlong|Guangyuan (Lizhou)|CN|32.3903|105.695|0|241|1
GYU|ZLGY|Guyuan Liupanshan|Guyuan (Yuanzhou)|CN|36.0789|106.217|5727|241|1
GYY|KGYY|Gary/Chicago||US|41.6171|-87.4132|591|87|1
GZP|LTFG|Gazipaşa-Alanya||TR|36.2988|32.297|92|294|1
HAC|RJTH|Hachijojima||JP|33.1148|139.786|303|249|1
HAD|ESMT|Halmstad||SE|56.6911|12.8202|101|320|1
HAU|ENHD|Haugesund Airport, Karmøy||NO|59.3453|5.2084|86|308|1
HBX|VOHB|Hubballi||IN|15.3611|75.0821|2171|216|1
HCJ|ZGHC|Hechi Jinchengjiang|Hechi (Jinchengjiang)|CN|24.8043|107.711|2221|241|1
HCR|PAHC|Holy Cross||US|62.1883|-159.775|70|53|1
HCZ|ZGCZ|Chenzhou Beihu||CN|25.7534|112.845|1071|241|1
HDF|EDAH|Heringsdorf|Zirchow|DE|53.8787|14.1523|94|282|1
HDG|ZBHD|Handan||CN|36.5248|114.424|229|241|1
HDM|OIHH|Hamadan||IR|34.8664|48.5607|5755|247|1
HDN|KHDN|Yampa Valley|Hayden|US|40.4812|-107.218|6606|95|1
HDS|FAHS|Eastgate Airport / Air Force Base Hoedspruit||ZA|-24.3619|31.0529|1801|24|1
HEH|VYHH|Heho||MM|20.7471|96.792|3858|256|1
HEK|ZYHE|Heihe Aihui||CN|50.1716|127.309|1047|241|1
HFA|LLHA|Uri Michaeli Haifa||IL|32.8102|35.0437|28|210|1
HFN|BIHN|Hornafjörður|Höfn|IS|64.2956|-15.2272|24|265|1
HFT|ENHF|Hammerfest||NO|70.6797|23.6686|266|308|1
HGI|VEHO|Itanagar Donyi Polo Hollongi||IN|26.9668|93.6388|328|216|1
HGN|VTCH|Mae Hong Son||TH|19.3013|97.9758|929|190|1
HGO|DIKO|Korhogo||CI|9.3872|-5.5567|1214|1|1
HGR|KHGR|Hagerstown Regional Richard A Henson Field||US|39.7088|-77.728|703|139|1
HGU|AYMH|Mount Hagen Kagamuga||PG|-5.8282|144.299|5388|365|1
HHH|KHXD|Hilton Head|Hilton Head Island|US|32.2244|-80.6975|19|139|1
HHQ|VTPH|Hua Hin||TH|12.6362|99.9515|62|190|1
HHR|KHHR|Jack Northrop Field Hawthorne||US|33.9228|-118.335|66|122|1
HIB|KHIB|Range|Hibbing|US|47.3848|-92.8369|1354|87|1
HID|YHID|Horn Island||AU|-10.5856|142.293|43|269|1
HII|KHII|Lake Havasu City||US|34.5705|-114.358|783|145|1
HIN|RKPS|Sacheon Airport / Sacheon||KR|35.0886|128.072|25|240|1
HJJ|ZGCJ|Huaihua Zhijiang||CN|27.4431|109.705|882|241|1
HJR|VEKO|Khajuraho||IN|24.8172|79.9186|728|216|1
HKK|NZHK|Hokitika||NZ|-42.7136|170.985|146|340|1
HKN|AYHK|Hoskins|Kimbe|PG|-5.4638|150.407|66|365|1
HLE|FHSH|Saint Helena|Jamestown|SH|-15.9589|-5.6461|1017|266|1
HLN|KHLN|Helena||US|46.6068|-111.983|3877|95|1
HLZ|NZHN|Hamilton||NZ|-37.867|175.332|172|340|1
HMA|USHH|Khanty Mansiysk|Khanty-Mansiysk|RU|61.0285|69.0861|76|257|1
HME|DAUH|Hassi Messaoud-Oued Irara Krim Belkacem||DZ|31.673|6.1404|463|4|1
HMI|ZWHM|Hami||CN|42.8414|93.6692|2703|241|1
HNA|RJSI|Iwate Hanamaki||JP|39.4286|141.135|297|249|1
HNM|PHHN|Hana||US|20.7956|-156.014|78|352|1
HNS|PAHN|Haines||US|59.2439|-135.524|15|117|1
HOB|KHOB|Lea County|Hobbs|US|32.6875|-103.217|3661|95|1
HOI|NTTO|Hao|Otepa|PF|-18.0748|-140.946|10|368|1
HOM|PAHO|Homer||US|59.6445|-151.479|84|53|1
HOR|LPHR|Horta||PT|38.5199|-28.7159|118|259|1
HOT|KHOT|Memorial Field|Hot Springs|US|34.4788|-93.0963|540|87|1
HOV|ENOV|Ørsta-Volda Airport, Hovden||NO|62.18|6.0741|243|308|1
HPA|NFTL|Lifuka Island||TO|-19.777|-174.341|31|370|1
HPG|ZHSN|Shennongjia Hongping|Shennongjia (Hongping)|CN|31.626|110.34|8365|0|1
HPN|KHPN|Westchester|White Plains|US|41.067|-73.7076|439|139|1
HQL|ZWTK|Tashikuergan Hongqilafu||CN|37.6613|75.2889|10499|241|1
HRI|VCRI|Mattala Rajapaksa||LK|6.2839|81.1242|157|197|1
HRL|KHRL|Valley|Harlingen|US|26.2285|-97.6544|36|87|1
HRO|KHRO|Boone|Harrison|US|36.2615|-93.1547|1365|87|1
HSC|ZGSG|Shaoguan Danxia||CN|24.9786|113.421|280|241|1
HSL|PAHL|Huslia||US|65.6979|-156.351|220|53|1
HSV|KHSV|Huntsville||US|34.6362|-86.7744|629|87|1
HTG|UOHH|Khatanga||RU|71.9781|102.491|95|217|1
HTI|YBHM|Hamilton Island||AU|-20.3581|148.952|15|273|1
HTN|ZWTN|Hotan||CN|37.0385|79.8649|4672|241|1
HTS|KHTS|Tri-State Airport / Milton J. Ferguson Field|Huntington|US|38.3667|-82.558|828|139|1
HTT|ZLHX|Huatugou|Mengnai|CN|38.2016|90.8378|2945|0|1
HTY|LTDA|Hatay|Antakya|TR|36.3608|36.2856|269|294|1
HUH|NTTH|Huahine-Fare||PF|-16.6871|-151.022|7|368|1
HUI|VVPB|Phu Bai|Huế|VN|16.4006|107.703|48|204|1
HUO|ZBHZ|Holingol Huolinhe||CN|45.4872|119.407|0|241|1
HUU|SPNC|Alferez Fap David Figueroa Fernandini|Huánuco|PE|-9.8788|-76.2048|6070|121|1
HUY|EGNJ|Humberside|Grimsby, Lincolnshire|GB|53.5762|-0.3495|121|301|1
HUZ|ZGHZ|Huizhou Pingtan|Huizhou (Pingtan)|CN|23.05|114.6|50|241|1
HVB|YHBA|Hervey Bay||AU|-25.3201|152.881|60|269|1
HVD|ZMKD|Khovd||MN|47.9541|91.6282|4898|206|1
HVG|ENHV|Honningsvåg Airport, Valan||NO|71.0097|25.9836|44|308|1
HVN|KHVN|Tweed New Haven||US|41.2629|-72.8877|12|139|1
HVR|KHVR|Havre City||US|48.5414|-109.763|2591|95|1
HXD|ZLDL|Haixi Delingha||CN|37.1253|97.2687|9843|241|1
HYA|KHYA|Cape Cod Gateway|Hyannis|US|41.6693|-70.2804|54|139|1
HYN|ZSLQ|Taizhou Luqiao|Taizhou (Luqiao)|CN|28.5622|121.429|0|241|1
HYS|KHYS|Hays||US|38.8445|-99.2731|1999|87|1
HZA|ZSHZ|Heze Mudan|Heze (Dingtao)|CN|35.213|115.737|0|0|1
HZG|ZLHZ|Hanzhong Chenggu|Hanzhong (Chenggu)|CN|33.1335|107.204|0|241|1
HZH|ZUNP|Liping||CN|26.3222|109.15|1620|241|1
IAA|UOII|Igarka||RU|67.4372|86.6219|82|217|1
IAG|KIAG|Niagara Falls||US|43.1073|-78.9462|589|139|1
IAM|DAUZ|Zarzaitine - In Aménas||DZ|28.0515|9.6429|1847|4|1
IAN|PAIK|Bob Baker Memorial|Kiana|US|66.9761|-160.439|166|53|1
IBA|DNIB|Ibadan||NG|7.3625|3.9783|725|30|1
IBE|SKIB|Perales|Ibagué|CO|4.4216|-75.1333|2999|79|1
ICT|KICT|Wichita Dwight D. Eisenhower||US|37.6503|-97.4286|1333|87|1
IDA|KIDA|Idaho Falls||US|43.5146|-112.071|4744|80|1
IEG|EPZG|Zielona Góra-Babimost|Nowe Kramsko|PL|52.1385|15.7986|194|327|1
IFJ|BIIS|Ísafjörður||IS|66.0581|-23.1353|8|265|1
IFO|UKLI|Ivano-Frankivsk||UA|48.8842|24.6861|919|298|1
IGA|MYIG|Inagua|Matthew Town|BS|20.975|-73.6669|8|138|1
IGD|LTCT|Iğdır||TR|39.9766|43.8766|3101|294|1
IGR|SARI|Cataratas Del Iguazú|Puerto Iguazu|AR|-25.7373|-54.4734|916|59|1
IGT|URMS|Magas|Sunzha|RU|43.3233|45.0126|1165|307|1
IJK|USII|Izhevsk||RU|56.8345|53.4622|531|314|1
IKG|UCFK|Karakol||KG|42.5081|78.4078|5590|0|1
IKI|RJDB|Iki||JP|33.749|129.785|41|249|1
IKS|UEST|Tiksi||RU|71.6977|128.903|26|255|1
ILD|LEDA|Lleida-Alguaire||ES|41.7282|0.535|1152|303|1
ILG|KILG|Wilmington||US|39.6787|-75.6065|80|139|1
ILI|PAIL|Iliamna||US|59.7544|-154.911|192|53|1
ILM|KILM|Wilmington||US|34.2723|-77.9051|32|139|1
ILP|NWWE|Île des Pins||NC|-22.5889|167.456|315|361|1
ILQ|SPLO|General Jorge Fernandez Maldon|Ilo|PE|-17.695|-71.344|72|121|1
ILS|MSSS|Ilopango|San Salvador|SV|13.6995|-89.1199|2027|99|1
ILY|EGPI|Islay|Isle of Islay, Argyll and Bute|GB|55.6827|-6.2575|56|301|1
IMP|SBIZ|Prefeito Renato Moreira|Imperatriz|BR|-5.5313|-47.46|430|101|1
IMT|KIMT|Ford|Kingsford|US|45.8191|-88.1146|1182|87|1
INH|FQIN|Inhambane||MZ|-23.8764|35.4085|30|37|1
INL|KINL|Falls|International Falls|US|48.5662|-93.4031|1185|87|1
INU|ANYN|Nauru|Yaren|NR|-0.5479|166.919|22|358|1
INV|EGPE|Inverness||GB|57.5425|-4.0475|31|301|1
INZ|DAUI|In Salah||DZ|27.251|2.512|896|4|1
IOA|LGIO|Ioannina King Pyrrhus||GR|39.6964|20.8225|1558|280|1
IOS|SBIL|Bahia - Jorge Amado|Ilhéus|BR|-14.8159|-39.0335|15|72|1
IPI|SKIP|San Luis|Ipiales|CO|0.8619|-77.6718|9765|79|1
IPL|KIPL|Imperial||US|32.8354|-115.574|-54|122|1
IPN|SBIP|Usiminas|Ipatinga|BR|-19.4707|-42.4876|786|159|1
IPT|KIPT|Williamsport||US|41.2421|-76.9224|529|139|1
IQM|ZWCM|Qiemo Yudu||CN|38.2345|85.4655|0|241|1
IQN|ZLQY|Qingyang Xifeng|Qingyang (Xifeng)|CN|35.8026|107.599|0|241|1
IRG|YLHR|Lockhart River||AU|-12.7869|143.305|77|269|1
IRJ|SANL|Capitan V A Almonacid|La Rioja|AR|-29.3816|-66.7958|1437|61|1
IRK|KIRK|Kirksville||US|40.0935|-92.5449|966|87|1
IRP|FZJH|Matari|Isiro|CD|2.8276|27.5883|2438|34|1
ISA|YBMA|Mount Isa||AU|-20.6664|139.488|1121|269|1
ISE|LTFC|Süleyman Demirel|Isparta|TR|37.8554|30.3684|2835|294|1
ISG|ROIG|New Ishigaki||JP|24.3964|124.245|102|249|1
ISP|KISP|Long Island MacArthur|Islip|US|40.7963|-73.1017|99|139|1
ISU|ORSJ|Jalal Talabani|Sulaymaniyah|IQ|35.5605|45.3151|2494|187|1
ITB|SBIH|Itaituba||BR|-4.2421|-56.0007|110|156|1
ITH|KITH|Ithaca Tompkins||US|42.491|-76.4584|1099|139|1
ITO|PHTO|Hilo||US|19.7214|-155.045|38|352|1
IUE|NIUE|Niue|Alofi|NU|-19.0801|-169.923|209|359|1
IVC|NZNV|Invercargill||NZ|-46.4124|168.313|5|340|1
IWA|UUBI|Ivanovo South||RU|56.9394|40.9408|410|307|1
IWJ|RJOW|Iwami|Masuda|JP|34.6764|131.79|184|249|1
IWK|RJOI|Iwakuni Kintaikyo||JP|34.1463|132.247|7|249|1
IXA|VEAT|Agartala - Maharaja Bir Bikram||IN|23.887|91.2404|46|216|1
IXD|VEAB|Prayagraj|Allahabad|IN|25.4401|81.7339|322|216|1
IXG|VOBM|Belagavi|Belgaum|IN|15.8593|74.6183|2487|216|1
IXI|VELR|Lilabari North Lakhimpur||IN|27.2957|94.0973|330|216|1
IXJ|VIJU|Jammu||IN|32.6888|74.8382|996|216|1
IXK|VAKS|Keshod||IN|21.3171|70.2704|167|216|1
IXL|VILH|Leh Kushok Bakula Rimpochee||IN|34.1359|77.5465|10682|216|1
IXM|VOMD|Madurai||IN|9.8345|78.0934|459|216|1
IXP|VIPK|Pathankot||IN|32.2336|75.6344|1017|216|1
IXR|VERC|Birsa Munda|Ranchi|IN|23.3143|85.3217|2148|216|1
IXS|VEKU|Silchar||IN|24.9129|92.9787|352|216|1
IXU|VAAU|Aurangabad||IN|19.8629|75.3963|1911|216|1
IXY|VAKE|Kandla||IN|23.1127|70.1003|96|216|1
IZA|SBZM|Presidente Itamar Franco|Juiz de Fora|BR|-21.5131|-43.1731|1348|159|1
IZO|RJOC|Izumo Enmusubi||JP|35.4136|132.89|15|249|1
IZT|MMIT|General Antonio Cárdenas Rodríguez National Airport / Ixtepec||MX|16.446|-95.0937|164|132|1
JAC|KJAC|Jackson Hole||US|43.6073|-110.738|6451|95|1
JAE|SPJE|Shumba|Jaén|PE|-5.5925|-78.774|2477|121|1
JAN|KJAN|Jackson-Medgar Wiley Evers||US|32.3112|-90.0759|346|87|1
JAU|SPJJ|Francisco Carle|Jauja|PE|-11.7831|-75.4734|11034|121|1
JAV|BGJN|Ilulissat||GL|69.2432|-51.0571|95|142|1
JBQ|MDJB|La Isabela||DO|18.5725|-69.9856|98|158|1
JBR|KJBR|Jonesboro||US|35.8317|-90.6464|262|87|1
JDF|SBJF|Francisco de Assis|Juiz de Fora|BR|-21.7915|-43.3861|2989|159|1
JDH|VIJO|Jodhpur||IN|26.2511|73.0489|717|216|1
JDZ|ZSJD|Jingdezhen Luojia||CN|29.3386|117.176|112|241|1
JEE|MTJE|Jérémie|Carrefour Sanon|HT|18.6631|-74.1703|147|146|1
JEG|BGAA|Aasiaat||GL|68.7218|-52.7847|74|142|1
JER|EGJJ|Jersey|St. Peter|JE|49.2079|-2.1955|277|295|1
JGA|VAJM|Jamnagar||IN|22.4655|70.0126|69|216|1
JGD|ZYJD|Daxing'anling Elunchun|Jiagedaqi|CN|50.3714|124.118|1205|0|1
JGS|ZSGS|Jinggangshan|Ji'an|CN|26.8569|114.737|281|241|1
JHM|PHJH|Kapalua|Lahaina|US|20.9629|-156.673|256|352|1
JHS|BGSS|Sisimiut||GL|66.9513|-53.7293|33|142|1
JIC|ZLJC|Jinchang Jinchuan||CN|38.5422|102.348|4740|241|1
JIM|HAJM|Jimma||ET|7.6661|36.8166|5500|3|1
JIQ|ZUQJ|Qianjiang Wulingshan||CN|29.5133|108.831|2075|241|1
JJD|SBJE|Comandante Ariston Pessoa|Cruz|BR|-2.9064|-40.3573|89|101|1
JJU|BGQO|Qaqortoq||GL|60.7638|-46.065|505|0|1
JKG|ESGJ|Jönköping||SE|57.7576|14.0687|741|320|1
JKH|LGHI|Chios Island||GR|38.3432|26.1406|15|280|1
JKR|VNJP|Janakpur||NP|26.7088|85.9224|256|214|1
JLN|KJLN|Joplin||US|37.1518|-94.4983|981|87|1
JLR|VAJB|Jabalpur||IN|23.1778|80.052|1624|216|1
JMJ|ZPJM|Lancang Jingmai|Pu'er (Lancang)|CN|22.4177|99.784|0|0|1
JMK|LGMK|Mykonos Island||GR|37.4351|25.3481|405|280|1
JMS|KJMS|Jamestown||US|46.9297|-98.6782|1500|87|1
JMU|ZYJM|Jiamusi Songjiang||CN|46.8428|130.464|262|241|1
JNG|ZSJG|Jining Da'an||CN|35.6474|116.743|171|241|1
JNH|ZSJX|Jiaxing Nanhu|Xiuzhou, Hangzhou|CN|30.6981|120.663|15|241|1
JNU|PAJN|Juneau||US|58.3549|-134.574|21|117|1
JNZ|ZYJZ|Jinzhou Bay|Jinzhou (Linghai)|CN|40.936|121.277|0|241|1
JOE|EFJO|Joensuu||FI|62.6588|29.6194|398|292|1
JOG|WAHH|Adisutjipto|Yogyakarta|ID|-7.7882|110.432|379|208|1
JOI|SBJV|Lauro Carneiro de Loyola|Joinville|BR|-26.2245|-48.7974|15|159|1
JOL|RPMJ|Jolo||PH|6.0537|121.011|118|224|1
JOS|DNJO|Yakubu Gowon|Jos|NG|9.6398|8.8691|4232|30|1
JRH|VEJT|Jorhat||IN|26.7305|94.1754|311|216|1
JSA|VIJR|Jaisalmer||IN|26.8887|70.865|751|216|1
JSH|LGST|Sitia|Crete Island|GR|35.2161|26.1013|376|280|1
JSI|LGSK|Skiathos Island||GR|39.1771|23.5037|54|280|1
JSJ|ZYJS|Jiansanjiang Shidi||CN|47.1082|132.658|0|0|1
JSR|VGJR|Jessore|Jashore (Jessore)|BD|23.1838|89.1608|20|199|1
JST|KJST|John Murtha Johnstown Cambria||US|40.3161|-78.8339|2284|139|1
JTC|SBAE|Bauru/Arealva–Moussa Nakhal Tobias State||BR|-22.1608|-49.0703|1962|159|1
JUZ|ZSJU|Quzhou|Quzhou (Kezheng)|CN|28.9661|118.899|213|241|1
JXA|ZYJX|Jixi Xingkaihu||CN|45.293|131.193|760|241|1
JYV|EFJY|Jyväskylä|Jyväskylän Maalaiskunta|FI|62.3995|25.6783|459|292|1
JZH|ZUJZ|Jiuzhai Huanglong|Ngawa (Songpan)|CN|32.8533|103.682|11327|241|1
KAB|FVKB|Kariba||ZW|-16.5198|28.885|1706|23|1
KAC|OSKL|Qamishli||SY|37.0206|41.1914|1480|198|1
KAI|SYKA|Kaieteur|Kaieteur Falls|GY|5.1773|-59.489|1520|0|1
KAJ|EFKI|Kajaani||FI|64.2855|27.6924|483|292|1
KAO|EFKS|Kuusamo||FI|65.9876|29.2394|866|292|1
KAT|NZKT|Kaitaia|Awanui|NZ|-35.0698|173.287|270|340|1
KAW|VYKT|Kawthoung||MM|10.0493|98.538|180|256|1
KBR|WMKC|Sultan Ismail Petra|Kota Baharu|MY|6.1669|102.293|16|218|1
KCM|LTCN|Kahramanmaraş||TR|37.5388|36.9535|1723|294|1
KCT|VCCK|Koggala|Galle|LK|5.9937|80.3203|10|197|1
KCY|UNKM|Krasnoyarsk Cheremshanka||RU|56.1776|92.5459|833|217|1
KDL|EEKA|Kärdla||EE|58.9908|22.8307|18|321|1
KDM|VRMT|Kaadedhdhoo|Huvadhu Atoll|MV|0.4881|72.9969|2|335|1
KDO|VRMK|Kadhdhoo||MV|1.8592|73.5219|4|335|1
KEM|EFKE|Kemi-Tornio|Kemi / Tornio|FI|65.7787|24.5821|61|292|1
KEP|VNNG|Nepalgunj||NP|28.1036|81.667|540|214|1
KET|VYKG|Kengtung||MM|21.3016|99.636|2798|256|1
KFS|LTAL|Kastamonu||TR|41.3142|33.7958|3520|294|1
KGA|FZUA|Kananga||CD|-5.9001|22.4692|2139|34|1
KGC|YKSC|Kingscote||AU|-35.7139|137.521|24|268|1
KGI|YPKG|Kalgoorlie Boulder|Broadwood|AU|-30.7915|121.465|1203|276|1
KGP|USRK|Kogalym||RU|62.1904|74.5338|220|257|1
KGT|ZUKD|Kangding|Garzê (Kangding)|CN|30.1425|101.739|14042|0|1
KHD|OICK|Khoram Abad||IR|33.4354|48.2829|3782|247|1
KHE|UKOH|Kherson||UA|46.6758|32.5064|148|298|1
KHK|OIBQ|Khark||IR|29.2605|50.3222|17|247|1
KHS|OOKB|Khasab||OM|26.171|56.2406|100|225|1
KHT|OAKS|Khost||AF|33.2846|69.8073|4204|211|1
KHV|UHHH|Khabarovsk Novy||RU|48.5283|135.189|244|254|1
KHX||Savannah Airstrip|Kihihi|UG|-0.7165|29.6997|3600|0|1
KIR|EIKY|Kerry|Farranfore|IE|52.1809|-9.5238|112|289|1
KJB|VOKU|Kurnool|Orvakal|IN|15.7163|78.1692|920|216|1
KJH|ZUKJ|Kaili Huangping|Kaili (Huangping)|CN|26.972|107.988|3115|241|1
KJI|ZWKN|Burqin Kanas||CN|48.2223|86.9959|3921|0|1
KJT|WICA|Kertajati||ID|-6.6474|108.166|134|208|1
KKC|VTUK|Khon Kaen||TH|16.4666|102.784|670|190|1
KKE|NZKK|Kerikeri||NZ|-35.2591|173.913|492|340|1
KKN|ENKR|Kirkenes Airport, Høybuktmoen||NO|69.7258|29.8913|283|308|1
KKR|NTGK|Kaukura|Raitahiti|PF|-15.6633|-146.885|11|368|1
KKS|OIFK|Kashan||IR|33.8953|51.577|3465|247|1
KKW|FZCA|Kikwit||CD|-5.0358|18.7856|1572|29|1
KKX|RJKI|Kikai||JP|28.3213|129.928|21|249|1
KLH|VAKP|Kolhapur||IN|16.6647|74.2894|1996|216|1
KLR|ESMQ|Kalmar||SE|56.6855|16.2876|17|320|1
KLW|PAKW|Klawock||US|55.5792|-133.076|80|161|1
KLX|LGKL|Kalamata||GR|37.0683|22.0255|26|280|1
KMA|AYKM|Kerema||PG|-7.9636|145.771|10|365|1
KMC|OEKK|King Khaled Military City||SA|27.9009|45.5282|1352|237|1
KME|HRZA|Kamembe||RW|-2.4622|28.9079|5192|28|1
KMW|UUBA|Kostroma Sokerkino||RU|57.7969|41.0194|446|307|1
KND|FZOA|Kindu||CD|-2.9192|25.9154|1630|34|1
KNG|WASK|Utarom|Kaimana|ID|-3.6446|133.695|19|209|1
KNH|RCBS|Kinmen|Shang-I|TW|24.4279|118.359|93|244|1
KNQ|NWWD|Koné||NC|-21.0536|164.839|23|361|1
KNS|YKII|King Island||AU|-39.8775|143.878|132|272|1
KNU|VECX|Kanpur||IN|26.4043|80.4101|410|216|1
KNX|YPKU|East Kimberley Regional (Kununurra)||AU|-15.7781|128.708|145|276|1
KOE|WATT|El Tari|Kupang|ID|-10.1716|123.671|335|223|1
KOI|EGPA|Kirkwall|Kirkwall, Orkney Islands|GB|58.9579|-2.9051|50|301|1
KOK|EFKK|Kokkola-Pietarsaari|Kokkola / Kruunupyy|FI|63.7212|23.1431|84|292|1
KOP|VTUW|Nakhon Phanom||TH|17.3838|104.643|587|190|1
KPO|RKTH|Pohang Airport (G-815/K-3)||KR|35.988|129.42|70|240|1
KPW|UHMK|Keperveem||RU|67.845|166.14|623|182|1
KQH|VIKG|Kishangarh Airport Ajmer|Ajmer (Kishangarh)|IN|26.591|74.813|0|216|1
KRF|ESNK|Kramfors-Sollefteå Höga Kusten|Nyland|SE|63.0486|17.7689|34|320|1
KRL|ZWKL|Korla Licheng||CN|41.615|86.1408|3041|241|1
KRO|USUU|Kurgan||RU|55.4753|65.4156|240|257|1
KRP|EKKA|Midtjyllands Airport / Air Base Karup||DK|56.2971|9.1043|170|288|1
KRW|UTAK|Turkmenbaşy||TM|40.0628|53.0051|279|185|1
KSC|LZKZ|Košice||SK|48.6631|21.2411|755|283|1
KSD|ESOK|Karlstad||SE|59.4447|13.3374|352|320|1
KSH|OICC|Shahid Ashrafi Esfahani|Kermanshah|IR|34.3459|47.1581|4307|247|1
KSL|HSKA|Kassala||SD|15.3875|36.3288|1671|27|1
KSU|ENKB|Kristiansund Airport, Kvernberget||NO|63.1118|7.8245|204|308|1
KSY|LTCF|Kars||TR|40.5622|43.115|5889|294|1
KSZ|ULKK|Kotlas||RU|61.2358|46.6975|184|307|1
KTA|YPKA|Karratha||AU|-20.7122|116.773|29|276|1
KTD|RORK|Kitadaito|Kitadaitōjima|JP|25.9447|131.327|80|249|1
KTG|WIOK|Rahadi Osman|Ketapang|ID|-1.8172|109.963|46|232|1
KTN|PAKT|Ketchikan||US|55.3556|-131.714|89|161|1
KTP|MKTP|Tinson Pen||JM|17.9886|-76.8238|16|116|1
KUA|WMKD|Kuantan||MY|3.7754|103.209|58|218|1
KUH|RJCK|Kushiro||JP|43.041|144.193|327|249|1
KUM|RJFC|Yakushima||JP|30.3856|130.659|124|249|1
KUS|BGKK|Kulusuk||GL|65.5736|-37.1236|117|142|1
KUU|VIBR|Kullu Manali|Bhuntar|IN|31.8767|77.1544|3573|216|1
KUV|RKJK|Gunsan Airport / Gunsan||KR|35.9038|126.616|29|240|1
KVG|AYKV|Kavieng||PG|-2.5794|150.808|7|365|1
KVO|LYKV|Morava|Kraljevo|RS|43.8175|20.5867|686|281|1
KVX|USKK|Pobedilovo|Kirov|RU|58.5039|49.3478|479|297|1
KWA|PKWA|Bucholz Army Air Field|Kwajalein|MH|8.7201|167.732|9|355|1
KWG|UKDR|Kryvyi Rih||UA|48.0433|33.21|408|298|1
KWJ|RKJJ|Gwangju||KR|35.1232|126.805|39|240|1
KWM|YKOW|Kowanyama||AU|-15.4854|141.753|35|269|1
KWZ|FZQM|Kolwezi||CD|-10.7659|25.5057|5007|34|1
KXB|WAWP|Sangia Nibandera|Kolaka|ID|-4.3382|121.524|40|223|1
KXK|UHKK|Komsomolsk-on-Amur||RU|50.409|136.934|92|254|1
KYD|RCLY|Lanyu|Orchid Island|TW|22.027|121.535|44|244|1
KYP|VYKP|Kyaukpyu||MM|19.4264|93.5348|20|256|1
KYS|GAKD|Kayes Dag Dag||ML|14.4825|-11.3993|164|6|1
KYZ|UNKY|Kyzyl||RU|51.6694|94.4006|2123|217|1
KZI|LGKZ|Kozani National Airport Filippos||GR|40.2861|21.8408|2059|280|1
LAF|KLAF|Purdue University|West Lafayette|US|40.4129|-86.9394|606|113|1
LAJ|SBLJ|Lages||BR|-27.7821|-50.2815|3065|159|1
LAL|KLAL|Lakeland Linder||US|27.9893|-82.0207|142|139|1
LAN|KLAN|Capital Region|Lansing|US|42.7776|-84.5857|861|96|1
LAP|MMLP|Manuel Márquez de León|La Paz|MX|24.0723|-110.363|69|129|1
LAR|KLAR|Laramie||US|41.3121|-105.675|7284|95|1
LAU|HKLU|Manda|Lamu|KE|-2.2524|40.9129|20|42|1
LAW|KLAW|Lawton Fort Sill||US|34.5677|-98.4166|1110|87|1
LBB|KLBB|Lubbock Preston Smith||US|33.6636|-101.823|3282|87|1
LBC|EDHL|Lübeck Blankensee||DE|53.8054|10.7192|53|282|1
LBE|KLBE|Arnold Palmer|Latrobe|US|40.2759|-79.4048|1199|139|1
LBF|KLBF|North Platte Regional Airport Lee Bird Field||US|41.1262|-100.684|2777|87|1
LBL|KLBL|Liberal Mid-America||US|37.0442|-100.96|2885|87|1
LBS|NFNL|Labasa||FJ|-16.4667|179.34|44|346|1
LBU|WBKL|Labuan||MY|5.3017|115.248|101|219|1
LCE|MHLC|Golosón|La Ceiba|HN|15.7425|-86.853|39|169|1
LCG|LECO|A Coruña|Culleredo|ES|43.3021|-8.3773|326|303|1
LCH|KLCH|Lake Charles||US|30.1261|-93.2233|15|87|1
LCK|KLCK|Rickenbacker|Columbus|US|39.8138|-82.9278|744|139|1
LCX|ZSLO|Liancheng Guanzhishan|Longyan (Liancheng)|CN|25.6759|116.746|1225|241|1
LCY|EGLC|London City||GB|51.5053|0.0553|19|301|1
LDB|SBLO|Governor José Richa|Londrina|BR|-23.3344|-51.1284|1867|159|1
LDE|LFBT|Tarbes-Lourdes-Pyrénées|Tarbes/Lourdes/Pyrénées|FR|43.1787|-0.0064|1260|309|1
LDS|ZYLD|Yichun Lindu||CN|47.7521|129.019|791|241|1
LDU|WBKD|Lahad Datu||MY|5.0324|118.324|45|219|1
LDX|SOOM|Saint-Laurent-du-Maroni||GF|5.4819|-54.035|16|85|1
LDY|EGAE|City of Derry|Derry, Derry and Strabane|GB|55.0428|-7.1611|22|301|1
LEA|YPLM|Learmonth|Exmouth|AU|-22.2352|114.09|19|276|1
LEB|KLEB|Lebanon||US|43.6261|-72.3042|603|139|1
LEI|LEAM|Almería||ES|36.8439|-2.3701|70|303|1
LEN|LELN|León|La Virgen del Camino|ES|42.5907|-5.6534|3006|303|1
LER|YLST|Leinster||AU|-27.8433|120.703|1631|276|1
LET|SKLT|Alfredo Vásquez Cobo|Leticia|CO|-4.1911|-69.942|277|79|1
LEU|LESU|Pirineus - la Seu d'Urgel|La Seu d'Urgell Pyrenees and Andorra|ES|42.3386|1.4092|2625|303|1
LEX|KLEX|Blue Grass|Lexington|US|38.0351|-84.6067|979|139|1
LFM|OISR|Lamerd||IR|27.3727|53.1888|1337|247|1
LFQ|ZBLF|Linfen Yaodu|Linfen (Yaodu)|CN|36.1326|111.641|1483|0|1
LFT|KLFT|Lafayette||US|30.2053|-91.9876|42|87|1
LGG|EBLG|Liège|Grâce-Hollogne|BE|50.6386|5.4439|659|284|1
LGI|MYLD|Deadman's Cay||BS|23.179|-75.0936|9|138|1
LHG|YLRD|Lightning Ridge||AU|-29.4529|147.977|540|277|1
LHL|UBLC|Lachin||AZ|39.8838|46.3631|5577|0|1
LHS|SAVH|Las Heras||AR|-46.5385|-68.9653|1082|63|1
LIF|NWWL|Lifou||NC|-20.7746|167.239|92|361|1
LIG|LFBL|Limoges|Limoges/Bellegarde|FR|45.8628|1.1794|1300|309|1
LIO|MRLM|Limón||CR|9.958|-83.022|7|90|1
LIT|KLIT|Bill & Hillary Clinton National Airport/Adams Field|Little Rock|US|34.7292|-92.2236|262|87|1
LIW|VYLK|Loikaw||MM|19.6915|97.2148|2940|256|1
LKL|ENNA|Lakselv Airport, Banak||NO|70.0688|24.9735|25|308|1
LKN|ENLK|Leknes||NO|68.1525|13.6094|78|308|1
LLF|ZGLG|Yongzhou Lingling||CN|26.3387|111.61|340|241|1
LLV|ZBLL|Lüliang Dawu||CN|37.6833|111.143|0|0|1
LME|LFRM|Le Mans-Arnage|Le Mans, Sarthe|FR|47.9486|0.2017|194|309|1
LMM|MMLM|Valle del Fuerte|Los Mochis|MX|25.6855|-109.081|16|129|1
LMN|WBGJ|Limbang||MY|4.8083|115.01|14|194|1
LMP|LICD|Lampedusa||IT|35.4979|12.6181|70|313|1
LNJ|ZPLC|Lincang Boshang||CN|23.7381|100.025|6230|241|1
LNK|KLNK|Lincoln||US|40.8449|-96.7618|1219|87|1
LNL|ZLLN|Longnan Chengzhou|Longnan (Cheng)|CN|33.7899|105.79|3707|241|1
LNO|YLEO|Leonora||AU|-28.8781|121.315|1217|276|1
LNS|KLNS|Lancaster||US|40.1217|-76.2961|403|139|1
LNY|PHNY|Lanai|Lanai City|US|20.7857|-156.951|1308|352|1
LOE|VTUL|Loei||TH|17.4391|101.722|860|190|1
LOO|DAUL|Laghouat - Molay Ahmed Medeghri||DZ|33.7644|2.9283|2510|4|1
LPF|ZUPS|Liupanshui Yuezhao|Liupanshui (Zhongshan)|CN|26.6094|104.979|0|241|1
LPK|UUOL|Lipetsk||RU|52.7028|39.5378|584|307|1
LPT|VTCL|Lampang||TH|18.2709|99.5042|811|190|1
LRD|KLRD|Laredo||US|27.5438|-99.4616|508|87|1
LRE|YLRE|Longreach||AU|-23.432|144.278|627|269|1
LRH|LFBH|La Rochelle Île de Ré||FR|46.1792|-1.1953|74|309|1
LRR|OISL|Lar||IR|27.6747|54.3833|2641|247|1
LRT|LFRH|Lorient South Brittany (Bretagne Sud)|Lorient/Lann/Bihoué|FR|47.7606|-3.44|160|309|1
LRU|KLRU|Las Cruces||US|32.2894|-106.922|4456|95|1
LSC|SCSE|La Florida|La Serena-Coquimbo|CL|-29.9162|-71.1995|481|157|1
LSE|KLSE|La Crosse||US|43.879|-91.2567|655|87|1
LSG||Leshan|Leshan (Wutongqiao)|CN|29.4386|103.749|1189|0|1
LSH|VYLS|Lashio||MM|22.9779|97.7522|2450|256|1
LSI|EGPB|Sumburgh|Lerwick, Shetland|GB|59.8789|-1.2956|20|301|1
LSP|SVJC|Josefa Camejo|Paraguaná|VE|11.7808|-70.1515|75|84|1
LSR|WIMU|Alas Leuser|Kutacane|ID|3.3915|97.8637|419|0|1
LST|YMLT|Launceston|Launceston (Western Junction)|AU|-41.5449|147.211|562|272|1
LSY|YLIS|Lismore||AU|-28.8307|153.258|35|277|1
LTD|HLTD|Ghadames||LY|30.1455|9.7021|1122|49|1
LTI|ZMAT|Altai||MN|46.3764|96.2211|7260|206|1
LTK|OSLK|Latakia||SY|35.4011|35.9487|157|198|1
LTM|SYLT|Lethem||GY|3.3728|-59.7894|351|78|1
LTU|VALT|Murod Kond|Latur|IN|18.4115|76.4647|2136|216|1
LTX|SELT|Cotopaxi|Latacunga|EC|-0.9068|-78.6158|9205|108|1
LUA|VNLK|Tenzing-Hillary|Lukla|NP|27.6868|86.7295|9380|214|1
LUD|FYLZ|Luderitz||NA|-26.6874|15.2429|457|51|1
LUG|LSZA|Lugano|Agno|CH|46.0043|8.9106|915|329|1
LUK|KLUK|Cincinnati Municipal Airport Lunken Field||US|39.1024|-84.4189|483|139|1
LUM|ZPMS|Dehong Mangshi|Dehong (Mangshi)|CN|24.4011|98.5317|2890|241|1
LUQ|SAOU|Brigadier Mayor D Cesar Raul Ojeda|San Luis|AR|-33.2732|-66.3564|2328|66|1
LUR|PALU|Cape Lisburne LRRS||US|68.8751|-166.11|16|140|1
LUV|WAPF|Karel Sadsuitubun|Langgur|ID|-5.7603|132.759|78|209|1
LWB|KLWB|Greenbrier Valley|Lewisburg|US|37.8579|-80.4004|2302|139|1
LWS|KLWS|Lewiston Nez Perce||US|46.3745|-117.015|1442|122|1
LYC|ESNL|Lycksele||SE|64.5483|18.7162|705|320|1
LYH|KLYH|Lynchburg Regional Airport - Preston Glenn Field||US|37.3267|-79.2004|938|139|1
LYI|ZSLY|Linyi Qiyang|Linyi (Hedong)|CN|35.0529|118.412|177|241|1
LYR|ENSB|Svalbard Airport, Longyear|Longyearbyen|NO|78.2461|15.4656|88|178|1
LZG|ZULA|Langzhong Gucheng|Nanchong (Langzhong)|CN|31.5019|106.034|1444|241|1
LZH|ZGZH|Liuzhou Bailian Airport / Bailian|Liuzhou (Liujiang)|CN|24.2075|109.391|295|241|1
LZN|RCFG|Matsu Nangan|Matsu (Nangan)|TW|26.1597|119.958|232|244|1
LZO|ZULZ|Luzhou Yunlong|Luzhou (Yunlong)|CN|29.0304|105.468|0|241|1
LZY|ZUNZ|Nyingchi Mainling|Nyingchi (Mainling)|CN|29.3033|94.3353|9675|241|1
MAB|SBMA|João Correa da Rocha|Marabá|BR|-5.3686|-49.138|357|75|1
MAF|KMAF|Midland International Air and Space Port||US|31.9425|-102.202|2871|87|1
MAG|AYMD|Madang||PG|-5.2071|145.789|20|365|1
MAK|HSSM|Malakal||SS|9.5587|31.6519|1291|25|1
MAM|MMMA|General Servando Canales|Matamoros|MX|25.7699|-97.5253|25|128|1
MAQ|VTPM|Mae Sot||TH|16.6999|98.5451|690|190|1
MAS|AYMO|Momote|Manus Island|PG|-2.0619|147.424|12|365|1
MAU|NTTP|Maupiti||PF|-16.4265|-152.244|15|368|1
MAZ|TJMZ|Eugenio Maria De Hostos|Mayaguez|PR|18.2557|-67.1485|28|149|1
MBD|FAMM|Mmabatho|Mafeking|ZA|-25.7984|25.548|4181|24|1
MBE|RJEB|Monbetsu||JP|44.3039|143.404|80|249|1
MBI|HTGW|Songwe|Mbeya|TZ|-8.9199|33.274|4412|17|1
MBS|KMBS|MBS|Freeland|US|43.5332|-84.0831|668|96|1
MBT|RPVJ|Moises R. Espinosa|Masbate|PH|12.3697|123.63|49|224|1
MBW|YMMB|Melbourne Moorabbin||AU|-37.9778|145.1|50|275|1
MBX|LJMB|Maribor Edvard Rusjan||SI|46.4799|15.6861|876|300|1
MCE|KMCE|Merced Regional Macready Field||US|37.2847|-120.514|155|122|1
MCG|PAMC|McGrath||US|62.9529|-155.606|341|53|1
MCK|KMCK|McCook Ben Nelson||US|40.2078|-100.593|2583|87|1
MCN|KMCN|Middle Georgia|Macon|US|32.6928|-83.6492|354|139|1
MCP|SBMQ|Macapá - Alberto Alcolumbre||BR|0.0507|-51.0722|56|75|1
MCW|KMCW|Mason City||US|43.1598|-93.3297|1213|87|1
MDG|ZYMD|Mudanjiang Hailang||CN|44.5252|129.569|883|241|1
MDI|DNMK|Makurdi||NG|7.7039|8.6139|371|30|1
MDK|FZEA|Mbandaka||CD|0.0226|18.2887|1040|29|1
MDQ|SAZM|Ástor Piazzola|Mar del Plata|AR|-37.9342|-57.5733|72|57|1
MDT|KMDT|Harrisburg||US|40.1928|-76.7623|310|139|1
MDU|AYMN|Mendi||PG|-6.1477|143.657|5680|365|1
MEB|YMEN|Melbourne Essendon|Essendon Fields|AU|-37.7281|144.902|282|275|1
MEC|SEMT|Eloy Alfaro|Manta|EC|-0.9461|-80.6788|48|108|1
MEE|NWWR|Maré||NC|-21.4824|168.038|141|361|1
MEG|FNMA|Malanje||AO|-9.5251|16.3124|3868|33|1
MEH|ENMH|Mehamn||NO|71.0297|27.8267|39|308|1
MEI|KMEI|Key Field / Meridian||US|32.3326|-88.7519|297|87|1
MEQ|WITC|Cut Nyak Dhien|Kuala Pesisir|ID|4.041|96.2533|10|208|1
MFE|KMFE|McAllen Miller||US|26.1761|-98.238|107|87|1
MFK|RCMT|Matsu Beigan|Matsu (Beigan)|TW|26.2241|120.003|41|244|1
MFR|KMFR|Rogue Valley International-Medford||US|42.3742|-122.873|1335|122|1
MGB|YMTG|Mount Gambier||AU|-37.7444|140.781|0|268|1
MGC|KMGC|Michigan City||US|41.7033|-86.8212|655|87|1
MGF|SBMG|Regional de Maringá - Sílvio Name Júnior||BR|-23.4761|-52.0162|1801|159|1
MGH|FAMG|Margate||ZA|-30.8574|30.343|495|24|1
MGM|KMGM|Montgomery Regional (Dannelly Field)||US|32.3006|-86.394|221|87|1
MGW|KMGW|Morgantown Municipal Airport Walter L. (Bill) Hart Field||US|39.6433|-79.9176|1248|139|1
MGZ|VYME|Myeik|Mkeik|MM|12.4398|98.6215|75|256|1
MHG|EDFM|Mannheim-City||DE|49.4731|8.5142|308|282|1
MHH|MYAM|Leonard M. Thompson|Marsh Harbour|BS|26.5107|-77.0843|6|138|1
MHK|KMHK|Manhattan||US|39.141|-96.6708|1057|87|1
MHQ|EFMA|Mariehamn||FI|60.1222|19.8982|17|305|1
MHT|KMHT|Manchester-Boston||US|42.9326|-71.4357|266|139|1
MHU|YHOT|Mount Hotham||AU|-37.0475|147.334|4260|275|1
MIG|ZUMY|Mianyang Nanjiao|Mianyang (Fucheng)|CN|31.4281|104.741|7874|241|1
MII|SBML|Frank Miloye Milenkowichi–Marília State||BR|-22.1969|-49.9265|2134|159|1
MIM|YMER|Merimbula||AU|-36.9086|149.901|7|277|1
MIR|DTMB|Monastir Habib Bourguiba||TN|35.7581|10.7547|9|50|1
MJF|ENMS|Mosjøen Airport, Kjærstad||NO|65.784|13.2149|237|308|1
MJK|YSHK|Shark Bay|Denham|AU|-25.8973|113.576|111|276|1
MJM|FZWA|Mbuji Mayi||CD|-6.1212|23.569|2221|34|1
MJT|LGMT|Mytilene||GR|39.0574|26.5986|60|280|1
MJZ|UERR|Mirny||RU|62.5347|114.039|1156|255|1
MKG|KMKG|Muskegon||US|43.1695|-86.2382|629|96|1
MKK|PHMK|Molokai|Kaunakakai|US|21.1529|-157.096|454|352|1
MKL|KMKL|McKellar-Sipes|Jackson|US|35.5999|-88.9156|434|87|1
MKM|WBGK|Mukah||MY|2.8819|112.043|20|219|1
MKP|NTGM|Makemo||PF|-16.5839|-143.658|3|368|1
MKQ|WAKK|Mopah|Merauke|ID|-8.5239|140.42|10|209|1
MKR|YMEK|Meekatharra||AU|-26.6117|118.548|1713|276|1
MKU|FOOK|Makokou||GA|0.5792|12.8909|1726|31|1
MKW|WAUU|Rendani|Manokwari|ID|-0.8918|134.049|23|209|1
MKY|YBMK|Mackay||AU|-21.1708|149.183|19|269|1
MKZ|WMKM|Malacca||MY|2.2656|102.253|35|218|1
MLB|KMLB|Melbourne Orlando||US|28.102|-80.6411|33|139|1
MLG|WARA|Abdul Rachman Saleh|Malang|ID|-7.9291|112.714|1726|208|1
MLI|KMLI|Quad City|Moline|US|41.4485|-90.5075|590|87|1
MLN|GEML|Melilla||ES|35.2798|-2.9563|156|14|1
MLU|KMLU|Monroe||US|32.5109|-92.0377|79|87|1
MLW|GLMR|Spriggs Payne|Monrovia|LR|6.2891|-10.7587|25|41|1
MLX|LTAT|Malatya Erhaç||TR|38.4353|38.091|2828|294|1
MMB|RJCM|Memanbetsu|Ōzora|JP|43.8806|144.164|135|249|1
MMD|ROMD|Minamidaito||JP|25.8465|131.263|167|249|1
MME|EGNV|Teesside|Darlington, Durham|GB|54.5092|-1.4294|120|301|1
MMG|YMOG|Mount Magnet||AU|-28.1161|117.842|1354|276|1
MMH|KMMH|Mammoth Yosemite|Mammoth Lakes|US|37.6254|-118.843|7135|122|1
MMJ|RJAF|Shinshu-Matsumoto||JP|36.1668|137.923|2182|249|1
MMO|GVMA|Maio|Vila do Maio|CV|15.1559|-23.2137|36|262|1
MMY|ROMY|Miyako|Miyakojima|JP|24.7828|125.295|150|249|1
MNC|FQNC|Nacala||MZ|-14.4882|40.7122|410|37|1
MNG|YMGD|Maningrida||AU|-12.0561|134.234|123|271|1
MNJ|FMSM|Mananjary||MG|-21.2018|48.3583|20|330|1
MNX|SBMY|Manicoré||BR|-5.8114|-61.2783|174|126|1
MOB|KMOB|Mobile||US|30.6912|-88.2428|219|87|1
MOC|SBMK|Mário Ribeiro|Montes Claros|BR|-16.7069|-43.8189|2191|159|1
MOG|VYMS|Mong Hsat||MM|20.5168|99.2568|1875|256|1
MOL|ENML|Molde Airport, Årø||NO|62.7447|7.2625|10|308|1
MOQ|FMMV|Morondava||MG|-20.2847|44.3176|30|330|1
MOT|KMOT|Minot||US|48.258|-101.279|1716|87|1
MOV|YMRB|Moranbah||AU|-22.0578|148.077|770|269|1
MOZ|NTTM|Moorea Temae|Moorea-Maiao|PF|-17.4898|-149.762|9|368|1
MPA|FYKM|Katima Mulilo|Mpacha|NA|-17.6343|24.1767|3144|51|1
MPH|RPVE|Godofredo P. Ramos|Caticlan|PH|11.9245|121.954|7|224|1
MPW|UKCM|Mariupol||UA|47.0761|37.4496|251|298|1
MPY|SOOA|Maripasoula||GF|3.6559|-54.0394|406|85|1
MQJ|UEMA|Moma|Khonuu|RU|66.4509|143.262|656|243|1
MQL|YMIA|Mildura||AU|-34.2292|142.086|167|275|1
MQM|LTCR|Mardin||TR|37.2233|40.6317|1729|294|1
MQN|ENRA|Mo i Rana Airport, Røssvoll||NO|66.3639|14.3014|229|308|1
MQS|TVSM|Mustique|Lovell|VC|12.8879|-61.1802|8|167|1
MQT|KSAW|Marquette/Sawyer|Gwinn|US|46.3515|-87.3959|1221|96|1
MQX|HAMK|Mekele Alula Aba Nega||ET|13.4674|39.5335|7396|3|1
MRE|HKMS|Mara Serena Lodge Airstrip||KE|-1.4046|35.0083|5200|42|1
MRI|PAMR|Merrill Field|Anchorage|US|61.2128|-149.844|137|53|1
MRX|OIAM|Mahshahr||IR|30.5562|49.1519|8|247|1
MRY|KMRY|Monterey||US|36.5868|-121.844|257|122|1
MRZ|YMOR|Moree||AU|-29.4989|149.845|701|277|1
MSJ|RJSM|Misawa Airport / Misawa||JP|40.7032|141.368|119|249|1
MSL|KMSL|Northwest Alabama|Muscle Shoals|US|34.7451|-87.613|551|87|1
MSN|KMSN|Dane County Regional Truax Field|Madison|US|43.1399|-89.3375|887|87|1
MSO|KMSO|Missoula Montana||US|46.9158|-114.091|3206|95|1
MSR|LTCK|Muş||TR|38.7478|41.6612|4157|294|1
MSS|KMSS|Massena International Airport Richards Field||US|44.9362|-74.8443|215|139|1
MSZ|FNMO|Welwitschia Mirabilis|Moçâmedes|AO|-15.2612|12.1468|210|33|1
MTJ|KMTJ|Montrose||US|38.5098|-107.894|5759|95|1
MTR|SKMR|Los Garzones|Montería|CO|8.8237|-75.8258|41|79|1
MTT|MMMT|Minatitlán/Coatzacoalcos|Cosoleacaque|MX|18.1034|-94.5807|36|132|1
MUA|AGGM|Munda||SB|-8.328|157.263|10|350|1
MUE|PHMU|Waimea Kohala|Waimea (Kamuela)|US|20.0013|-155.668|2671|352|1
MUN|SVMT|José Tadeo Monagas|Maturín|VE|9.749|-63.1533|224|84|1
MUR|WBGM|Marudi||MY|4.1787|114.33|103|219|1
MVB|FOON|M'Vengue El Hadj Omar Bongo Ondimba|Franceville|GA|-1.6562|13.438|1450|31|1
MVF|SBMS|Dix-Sept Rosado|Mossoró|BR|-5.2019|-37.3643|76|101|1
MVP|SKMU|Fabio Alberto Leon Bentley|Mitú|CO|1.2537|-70.2339|680|79|1
MVQ|UMOO|Mogilev||BY|53.9549|30.0951|637|306|1
MVR|FKKL|Salak|Maroua|CM|10.4514|14.2574|1390|19|1
MVT|NTGV|Mataiva||PF|-14.8681|-148.717|11|368|1
MWA|KMWA|Veterans Airport of Southern Illinois|Marion|US|37.7512|-89.0166|472|87|1
MWL|KMWL|Mineral Wells||US|32.7816|-98.0602|974|87|1
MXL|MMML|General Rodolfo Sánchez Taboada|Mexicali|MX|32.6306|-115.243|74|171|1
MXV|ZMMN|Mörön||MN|49.6637|100.1|4272|251|1
MXX|ESKM|Mora||SE|60.9579|14.5114|634|320|1
MYA|YMRY|Moruya||AU|-35.8978|150.144|14|277|1
MYD|HKML|Malindi||KE|-3.2293|40.1017|80|42|1
MYE|RJTQ|Miyakejima||JP|34.0736|139.56|67|249|1
MYG|MYMM|Mayaguana|Abraham Bay Settlement|BS|22.3795|-73.0135|11|138|1
MYL|KMYL|McCall||US|44.8888|-116.101|5024|80|1
MYP|UTAM|Mary||TM|37.6235|61.8957|728|185|1
MYQ|VOMY|Mysore||IN|12.2298|76.6537|2349|216|1
MYT|VYMK|Myitkyina||MM|25.3836|97.3519|475|256|1
MYU|PAMY|Mekoryuk||US|60.3723|-166.27|48|140|1
MYW|HTMT|Mtwara||TZ|-10.3362|40.182|371|17|1
MYY|WBGR|Miri||MY|4.322|113.987|59|219|1
MZI|GAMB|Mopti|Sévaré|ML|14.5128|-4.0796|906|6|1
MZL|SKMZ|La Nubia|Manizales|CO|5.0296|-75.4647|6871|79|1
MZO|MUMZ|Sierra Maestra|Manzanillo|CU|20.2886|-77.0875|112|111|1
MZQ|FAMU|Mkuze||ZA|-27.6261|32.0443|400|24|1
MZS|VIMB|Moradabad||IN|28.8175|78.9219|637|0|1
MZV|WBMU|Mulu||MY|4.0483|114.805|80|219|1
MZW|DAAY|Mecheria||DZ|33.5359|-0.2424|3855|4|1
NAA|YNBR|Narrabri||AU|-30.3192|149.827|788|277|1
NAH|WAMH|Naha|Tabukan Utara, Sangihe Islands|ID|3.6848|125.527|16|223|1
NAL|URMN|Nalchik||RU|43.5129|43.6366|1461|307|1
NAM|WAPN|Namniwel||ID|-3.1432|126.977|7|209|1
NAQ|BGQQ|Qaanaaq||GL|77.4886|-69.3887|51|170|1
NAW|VTSC|Narathiwat||TH|6.5199|101.743|16|190|1
NBC|UWKE|Begishevo|Nizhnekamsk|RU|55.5647|52.0925|643|307|1
NBE|DTNH|Enfidha - Hammamet||TN|36.0758|10.4386|21|50|1
NBS|ZYBS|Changbaishan||CN|42.0669|127.602|2874|241|1
NCA|MBNC|North Caicos||TC|21.9161|-71.943|10|104|1
NCY|LFLP|Annecy Meythet airport||FR|45.9289|6.0987|1521|309|1
NDC|VAND|Nanded||IN|19.1833|77.3167|1250|216|1
NDU|FYRU|Rundu||NA|-17.9565|19.7194|3627|51|1
NEC|SAZO|Necochea||AR|-38.4907|-58.8163|72|57|1
NER|UELL|Chulman|Neryungri|RU|56.9139|124.914|2812|255|1
NEV|TKPN|Vance W. Amory|Charlestown|KN|17.2057|-62.5899|14|164|1
NGE|FKKN|N'Gaoundéré||CM|7.357|13.5592|3655|19|1
NGQ|ZUAL|Ngari Gunsa|Shiquanhe|CN|32.0979|80.054|14022|241|1
NHV|NTMD|Nuku Hiva||PF|-8.7956|-140.229|220|357|1
NKM|RJNA|Nagoya Airport / JASDF Komaki||JP|35.2558|136.924|52|249|1
NKT|LTCV|Şırnak Şerafettin Elçi||TR|37.3647|42.0582|2038|0|1
NLD|MMNL|Quetzalcóatl|Nuevo Laredo|MX|27.4439|-99.5705|484|128|1
NLH|ZPNL|Ninglang Luguhu||CN|27.5403|100.759|10804|0|1
NLI|UHNN|Nikolayevsk-na-Amure|Nikolayevsk-na-Amure Airport|RU|53.155|140.65|170|254|1
NLK|YSNF|Norfolk Island|Burnt Pine|NF|-29.0418|167.94|371|360|1
NLT|ZWNL|Xinyuan Nalati||CN|43.4318|83.3786|3050|0|1
NMF|VRDA|Maafaru|Noonu Atoll|MV|5.8174|73.4684|6|335|1
NNM|ULAM|Naryan Mar||RU|67.64|53.1219|36|307|1
NNT|VTCN|Nan||TH|18.8079|100.783|685|190|1
NOB|MRNS|Nosara|Nicoya|CR|9.9765|-85.653|33|90|1
NOJ|USRO|Noyabrsk||RU|63.1833|75.27|446|257|1
NOP|LTCM|Sinop||TR|42.0183|35.0718|20|294|1
NOV|FNHU|Albano Machado|Huambo|AO|-12.8089|15.7605|5587|33|1
NOZ|UNWW|Spichenkovo|Novokuznetsk|RU|53.8114|86.8772|1024|227|1
NPE|NZNR|Hawke's Bay|Napier|NZ|-39.4658|176.87|6|340|1
NPL|NZNP|New Plymouth||NZ|-39.0086|174.179|97|340|1
NPO|WIOG|Nanga Pinoh|Nanga Pinoh-Borneo Island|ID|-0.3486|111.746|123|232|1
NPT|KUUU|Newport State||US|41.5322|-71.281|172|139|1
NQY|EGHQ|Cornwall Airport Newquay||GB|50.4406|-4.9954|390|301|1
NRA|YNAR|Narrandera||AU|-34.7022|146.512|474|277|1
NRK|ESSP|Norrköping||SE|58.5863|16.2506|32|320|1
NRR|TJRV|José Aponte de la Torre|Ceiba|PR|18.2473|-65.6398|38|149|1
NSH|OINN|Nowshahr||IR|36.6643|51.4627|-61|247|1
NSN|NZNS|Nelson||NZ|-41.2967|173.224|17|340|1
NST|VTSF|Nakhon Si Thammarat||TH|8.5396|99.9447|13|190|1
NTG|ZSNT|Nantong Xingdong|Nantong (Tongzhou)|CN|32.0736|120.98|16|241|1
NTN|YNTN|Normanton||AU|-17.6841|141.07|73|269|1
NTQ|RJNW|Noto Satoyama|Wajima|JP|37.2931|136.962|718|249|1
NTX|WIDO|Ranai|Ranai-Natuna Besar Island|ID|3.9087|108.388|7|208|1
NUI|PAQT|Nuiqsut||US|70.21|-151.006|38|53|1
NUX|USMU|Novy Urengoy||RU|66.0694|76.5203|210|257|1
NVA|SKNV|Benito Salas|Neiva|CO|2.9501|-75.294|1464|79|1
NVI|UZSA|Navoi||UZ|40.1176|65.1727|1140|239|1
NWI|EGSH|Norwich|Norwich, Norfolk|GB|52.6758|1.2828|118|301|1
NYA|USHN|Nyagan||RU|62.11|65.615|361|257|1
NYI|DGSN|Sunyani||GH|7.3618|-2.3288|1014|2|1
NYK|HKNL|Nanyuki Civil|Gathiuru|KE|-0.0624|37.0413|6250|42|1
NYM|USMM|Nadym||RU|65.4809|72.6989|49|257|1
NZC|SPZA|Maria Reiche Neuman|Nazca|PE|-14.854|-74.9615|1860|121|1
NZH|ZBMZ|Manzhouli Xijiao||CN|49.5667|117.33|2231|241|1
NZL|ZBZL|Zhalantun Genghis Khan||CN|47.8659|122.769|928|241|1
OAJ|KOAJ|Albert J Ellis|Richlands|US|34.8292|-77.6121|94|139|1
OBO|RJCB|Tokachi-Obihiro||JP|42.7333|143.217|505|249|1
OCC|SECO|Francisco De Orellana|Coca|EC|-0.4629|-76.9868|834|108|1
OCE|KOXB|Ocean City||US|38.3104|-75.124|11|139|1
OCJ|MKBS|Ian Fleming|Boscobel|JM|18.4041|-76.9698|90|116|1
ODB|LEBA|Córdoba||ES|37.842|-4.8489|297|303|1
OER|ESNO|Örnsköldsvik||SE|63.4083|18.99|354|320|1
OGD|KOGD|Ogden Hinckley||US|41.1959|-112.012|4473|95|1
OGL|SYEC|Eugene F. Correia|Ogle|GY|6.8059|-58.1077|10|109|1
OGN|ROYN|Yonaguni||JP|24.4673|122.98|70|249|1
OGS|KOGS|Ogdensburg||US|44.6819|-75.4655|297|139|1
OGU|LTCB|Ordu–Giresun||TR|40.9669|38.086|11|294|1
OGX|DAUU|Ain Beida|Ouargla|DZ|31.9172|5.4128|492|4|1
OGZ|URMO|Vladikavkaz Beslan||RU|43.2051|44.6066|1673|307|1
OHE|ZYMH|Mohe Gulian||CN|52.9169|122.423|1836|241|1
OHO|UHOO|Okhotsk||RU|59.4101|143.056|45|254|1
OIM|RJTO|Oshima|Izu Oshima|JP|34.782|139.36|130|249|1
OIR|RJEO|Okushiri|Okushiri Island|JP|42.0717|139.433|161|249|1
OIT|RJFO|Oita||JP|33.4794|131.737|19|249|1
OKD|RJCO|Sapporo Okadama||JP|43.1174|141.381|25|249|1
OKE|RJKB|Okinoerabu|Wadomari|JP|27.4316|128.706|101|249|1
OKI|RJNO|Oki Global Geopark|Okinoshima|JP|36.1784|133.324|311|249|1
OKL|WAJO|Oksibil||ID|-4.9071|140.628|4315|209|1
OKY|YBOK|Oakey Army Aviation Centre||AU|-27.4093|151.737|1335|269|1
OLA|ENOL|Ørland||NO|63.6989|9.604|28|308|1
OLF|KOLF|L M Clayton|Wolf Point|US|48.0945|-105.575|1986|95|1
OLM|KOLM|Olympia||US|46.9694|-122.903|209|122|1
OLZ|UEMO|Olyokminsk||RU|60.4018|120.476|656|255|1
OMD|FYOG|Oranjemund||NA|-28.5853|16.4464|14|24|1
OME|PAOM|Nome||US|64.5122|-165.445|37|140|1
OMH|OITR|Urmia||IR|37.6681|45.0687|4343|247|1
OMN|UZTZ|Zomin||UZ|40.014|68.411|1760|245|1
OND|FYOA|Ondangwa||NA|-17.8782|15.9526|3599|51|1
ONJ|RJSR|Odate Noshiro|Kitaakita|JP|40.1919|140.371|292|249|1
ONQ|LTAS|Zonguldak Çaycuma||TR|41.5064|32.0886|44|294|1
ONX|MPEJ|Enrique Adolfo Jimenez|Colón|PA|9.3566|-79.8674|25|143|1
OOM|YCOM|Cooma Snowy Mountains||AU|-36.3004|148.972|3088|277|1
OPF|KOPF|Miami-Opa Locka Executive||US|25.907|-80.2784|8|139|1
OPU|AYBM|Balimo||PG|-8.05|142.933|51|365|1
ORB|ESOE|Örebro||SE|59.2237|15.038|188|320|1
ORH|KORH|Worcester||US|42.2673|-71.8757|1009|139|1
ORT|PAOR|Northway||US|62.9613|-141.929|1715|53|1
OSD|ESNZ|Åre Östersund||SE|63.1935|14.5042|1233|320|1
OSI|LDOS|Osijek|Osijek(Klisa)|HR|45.4624|18.8113|290|328|1
OSW|UWOR|Orsk||RU|51.0725|58.5956|909|257|1
OTH|KOTH|Southwest Oregon|North Bend|US|43.4171|-124.246|17|122|1
OTZ|PAOT|Ralph Wien Memorial|Kotzebue|US|66.8847|-162.599|14|140|1
OUZ|GQPZ|Tazadit|Zouérate|MR|22.7573|-12.4822|1119|45|1
OVS|USHS|Sovetskiy||RU|61.3266|63.6019|351|257|1
OWB|KOWB|Owensboro Daviess||US|37.7401|-87.1668|407|87|1
OYE|FOGO|Oyem||GA|1.5431|11.5814|2158|31|1
OZC|RPMO|Labo|Ozamiz|PH|8.1785|123.842|75|224|1
PAB|VEBU|Bilaspur||IN|21.9884|82.111|899|216|1
PAC|MPMG|Marcos A. Gelabert|Albrook|PA|8.9733|-79.5556|31|143|1
PAE|KPAE|Seattle Paine Field|Everett|US|47.9063|-122.282|606|122|1
PAG|RPMP|Pagadian||PH|7.8256|123.46|5|224|1
PAH|KPAH|Barkley|Paducah|US|37.0608|-88.7738|410|87|1
PAT|VEPT|Jay Prakash Narayan|Patna|IN|25.5913|85.088|170|216|1
PAV|SBUF|Paulo Afonso||BR|-9.4009|-38.2506|883|72|1
PAZ|MMPA|El Tajín|Poza Rica|MX|20.6027|-97.4608|497|132|1
PBD|VAPR|Porbandar||IN|21.6495|69.6564|23|216|1
PBG|KPBG|Plattsburgh||US|44.6509|-73.4681|234|139|1
PBO|YPBO|Paraburdoo||AU|-23.1711|117.745|1406|276|1
PBR|MGPB|Puerto Barrios||GT|15.7309|-88.5838|33|107|1
PBU|VYPT|Putao||MM|27.3299|97.4263|1500|256|1
PCP|FPPR|Principe|São Tomé & Príncipe|ST|1.6612|7.4111|591|48|1
PCR|SKPC|German Olano|Puerto Carreño|CO|6.1847|-67.4932|177|79|1
PDA|SKPD|Obando Cesar Gaviria Trujillo|Puerto Inírida|CO|3.8535|-67.9062|460|79|1
PDK|KPDK|DeKalb Peachtree|Atlanta|US|33.8763|-84.3021|1003|139|1
PDO|WIPQ|Pendopo|Talang Gudang-Sumatra Island|ID|-3.2861|103.88|184|208|1
PDP|SULS|Capitan Corbeta CA Curbelo|Punta del Este|UY|-34.8551|-55.0943|95|136|1
PDS|MMPG|Piedras Negras||MX|28.6279|-100.535|901|128|1
PDT|KPDT|Eastern Oregon Regional Airport at Pendleton||US|45.6951|-118.841|1497|122|1
PEI|SKPE|Matecaña|Pereira|CO|4.8127|-75.7395|4416|79|1
PEM|SPTU|Padre Aldamiz|Puerto Maldonado|PE|-12.6136|-69.2286|659|121|1
PES|ULPB|Petrozavodsk||RU|61.8852|34.1547|151|307|1
PET|SBPK|João Simões Lopes Neto|Pelotas|BR|-31.7172|-52.3278|59|159|1
PEX|UUYP|Pechora||RU|65.1211|57.1308|98|307|1
PEZ|UWPP|Penza||RU|53.1106|45.0211|614|307|1
PFB|SBPF|Lauro Kurtz|Passo Fundo|BR|-28.244|-52.3278|2380|159|1
PGA|KPGA|Page||US|36.9242|-111.448|4316|145|1
PGD|KPGD|Punta Gorda||US|26.9202|-81.9905|26|139|1
PGF|LFMP|Perpignan-Rivesaltes (Llabanère)|Perpignan/Rivesaltes|FR|42.7404|2.8707|144|309|1
PGH|VIPT|Pantnagar||IN|29.0334|79.4737|769|216|1
PGK|WIKK|Depati Amir|Pangkal Pinang|ID|-2.1622|106.139|109|208|1
PGU|OIBP|Persian Gulf|Khiyaroo|IR|27.3796|52.7377|27|247|1
PGV|KPGV|Pitt-Greenville||US|35.6355|-77.3843|26|139|1
PGZ|SBPG|Ponta Grossa Airport - Comandante Antonio Amilton Beraldo||BR|-25.1845|-50.1438|2588|159|1
PHB|SBPB|Parnaíba - Prefeito Doutor João Silva Filho||BR|-2.8937|-41.732|23|101|1
PHF|KPHF|Newport News Williamsburg||US|37.1319|-76.493|42|139|1
PHG|DNPM|Port Harcourt City Airport / Port Harcourt Air Force Base||NG|4.8461|7.0214|57|0|1
PHS|VTPP|Phitsanulok||TH|16.7829|100.279|154|190|1
PHW|FAPH|Hendrik Van Eck|Phalaborwa|ZA|-23.9372|31.1554|1432|24|1
PHY|VTPB|Phetchabun||TH|16.676|101.195|450|190|1
PIA|KPIA|General Wayne A. Downing Peoria||US|40.6638|-89.6926|660|87|1
PIB|KPIB|Hattiesburg Laurel|Moselle|US|31.4671|-89.3371|298|87|1
PIH|KPIH|Pocatello||US|42.9098|-112.596|4452|80|1
PIR|KPIR|Pierre||US|44.3827|-100.286|1744|87|1
PIS|LFBI|Poitiers-Biard|Poitiers/Biard|FR|46.5877|0.3067|423|309|1
PIU|SPUR|PAF Captain Guillermo Concha Iberico|Piura|PE|-5.2058|-80.6164|120|121|1
PIX|LPPI|Pico|Pico Island|PT|38.5543|-28.4413|109|259|1
PIZ|PPIZ|Point Lay LRRS||US|69.7329|-163.005|22|140|1
PJM|MRPJ|Puerto Jimenez||CR|8.5333|-83.3|7|90|1
PKB|KPKB|Mid Ohio Valley|Parkersburg (Williamstown)|US|39.3451|-81.4392|858|139|1
PKE|YPKS|Parkes||AU|-33.1314|148.239|1069|277|1
PKR|VNPK|Pokhara||NP|28.2006|83.9812|2712|214|1
PKU|WIBB|Sultan Syarif Kasim II International Airport / Roesmin Nurjadin AFB|Pekanbaru|ID|0.4586|101.444|102|208|1
PKV|ULOO|Princess Olga Pskov||RU|57.7813|28.3938|154|307|1
PKY|WAGG|Tjilik Riwut|Palangkaraya|ID|-2.2271|113.943|82|232|1
PLJ|MZPL|Placencia||BZ|16.537|-88.3615|3|0|1
PLM|WIPP|Sultan Mahmud Badaruddin II|Palembang|ID|-2.8977|104.698|49|208|1
PLN|KPLN|Pellston Regional Airport of Emmet||US|45.5709|-84.7967|721|96|1
PLO|YPLC|Port Lincoln||AU|-34.6053|135.88|36|268|1
PLW|WAFF|Mutiara - SIS Al-Jufrie|Palu|ID|-0.9165|119.909|284|223|1
PMF|LIMP|Parma|Parma (PR)|IT|44.8264|10.2971|161|313|1
PMG|SBPP|Ponta Porã||BR|-22.5496|-55.7026|2156|70|1
PMQ|SAWP|Perito Moreno Jalil Hamer||AR|-46.5379|-70.9787|1410|63|1
PMR|NZPM|Palmerston North||NZ|-40.3206|175.617|151|340|1
PMW|SBPJ|Brigadeiro Lysias Rodrigues|Palmas|BR|-10.2915|-48.357|774|56|1
PMY|SAVY|El Tehuelche|Puerto Madryn|AR|-42.7592|-65.1027|427|58|1
PNA|LEPP|Pamplona||ES|42.77|-1.6463|1504|303|1
PNI|PTPN|Pohnpei|Pohnpei Island|FM|6.9851|158.21|10|364|1
PNL|LICG|Pantelleria|Pantelleria (TP)|IT|36.8165|11.9689|628|313|1
PNP|AYGR|Girua|Popondetta|PG|-8.8045|148.309|311|365|1
PNT|SCNT|Lieutenant Julio Gallardo|Puerto Natales|CL|-51.6707|-72.5291|217|150|1
PNY|VOPC|Pondicherry|Puducherry (Pondicherry)|IN|11.968|79.812|134|216|1
PNZ|SBPL|Senador Nilo Coelho|Petrolina|BR|-9.3624|-40.5691|1263|152|1
POL|FQPB|Pemba||MZ|-12.9933|40.5249|331|37|1
POP|MDPP|Gregorio Luperon|Puerto Plata|DO|19.7579|-70.57|15|158|1
POR|EFPO|Pori||FI|61.4617|21.8|44|292|1
PPB|SBDN|Presidente Prudente||BR|-22.1751|-51.4246|1477|159|1
PPN|SKPP|Guillermo León Valencia|Popayán|CO|2.4544|-76.6093|5687|79|1
PPP|YBPN|Proserpine Whitsunday Coast||AU|-20.4944|148.554|82|269|1
PQI|KPQI|Presque Isle||US|46.689|-68.0448|534|139|1
PQQ|YPMQ|Port Macquarie||AU|-31.4358|152.863|12|277|1
PRA|SAAP|General Urquiza|Parana|AR|-31.7948|-60.4804|242|59|1
PRC|KPRC|Prescott Regional Airport - Ernest A. Love Field||US|34.6535|-112.42|5045|145|1
PRI|FSPP|Praslin Island||SC|-4.3193|55.6916|10|334|1
PRM|LPPM|Portimão||PT|37.1493|-8.584|5|299|1
PSC|KPSC|Tri Cities|Pasco|US|46.2647|-119.119|410|122|1
PSE|TJPS|Mercedita|Ponce|PR|18.0083|-66.563|29|149|1
PSG|PAPG|Petersburg James A Johnson||US|56.8017|-132.945|111|161|1
PSM|KPSM|Portsmouth International Airport at Pease||US|43.0779|-70.8233|100|139|1
PSO|SKPS|Antonio Nariño|Chachagüí|CO|1.3967|-77.2909|5951|79|1
PSS|SARP|Libertador Gral D Jose De San Martin|Posadas|AR|-27.3858|-55.9707|430|59|1
PSU|WIOP|Pangsuma|Putussibau-Borneo Island|ID|0.8346|112.94|297|232|1
PSZ|SLPS|Capitán Av. Salvador Ogaya G. airport|Puerto Suárez|BO|-18.9753|-57.8206|440|120|1
PTH|PAPH|Port Heiden||US|56.9579|-158.63|95|53|1
PTJ|YPOD|Portland||AU|-38.3181|141.471|265|275|1
PTU|PAPM|Platinum||US|59.0177|-161.828|15|53|1
PUB|KPUB|Pueblo Memorial||US|38.2891|-104.497|4726|95|1
PUD|SAWD|Puerto Deseado||AR|-47.7353|-65.9041|268|63|1
PUF|LFBP|Pau Pyrénées|Pau/Pyrénées (Uzein)|FR|43.38|-0.4186|616|309|1
PUG|YPAG|Port Augusta||AU|-32.5069|137.717|56|268|1
PUU|SKAS|Tres De Mayo|Puerto Asís|CO|0.5052|-76.5008|815|79|1
PUW|KPUW|Pullman-Moscow||US|46.7416|-117.112|2556|122|1
PUZ|MNPC|Puerto Cabezas||NI|14.0472|-83.3867|52|125|1
PVA|SKPV|El Embrujo|Providencia|CO|13.3575|-81.358|10|79|1
PVK|LGPZ|Aktion|Preveza|GR|38.9255|20.7653|11|280|1
PVU|KPVU|Provo||US|40.2189|-111.722|4497|95|1
PWE|UHMP|Pevek|Apapelgino|RU|69.7833|170.597|11|182|1
PXM|MMPS|Puerto Escondido||MX|15.8768|-97.0891|294|132|1
PXO|LPPS|Porto Santo|Vila Baleira|PT|33.0734|-16.35|341|264|1
PXR|VTUJ|Surin||TH|14.8683|103.498|478|190|1
PXU|VVPK|Pleiku||VN|14.0045|108.017|2434|204|1
PYJ|UERP|Polyarny|Yakutia|RU|66.4004|112.03|1660|255|1
PZB|FAPM|Pietermaritzburg||ZA|-29.649|30.3987|2423|24|1
PZH|OPZB|Zhob|Fort Sandeman|PK|31.3584|69.4636|4728|213|1
PZI|ZUZH|Panzhihua Bao'anying|Panzhihua (Renhe)|CN|26.54|101.799|1620|241|1
QBC|CYBD|Bella Coola||CA|52.3875|-126.596|117|174|1
QOW|DNIM|Sam Mbakwe International Cargo|Owerri|NG|5.4271|7.206|373|30|1
QRW|DNSU|Warri|Okpe|NG|5.5982|5.8187|242|0|1
QSF|DAAS|Ain Arnat|Sétif|DZ|36.1785|5.3299|3360|4|1
QSR|LIRI|Salerno Costa d'Amalfi||IT|40.6204|14.9113|123|313|1
QSZ|ZWSC|Shache||CN|38.2454|77.0561|4232|0|1
QUO|DNAI|Akwa Ibom|Uyo|NG|4.8725|8.093|170|0|1
RAB|AYTK|Tokua|Kokopo|PG|-4.3405|152.38|49|365|1
RAE|OERR|Arar||SA|30.9066|41.1382|1813|237|1
RAH|OERF|Rafha||SA|29.6264|43.4906|1474|237|1
RAO|SBRP|Leite Lopes|Ribeirão Preto|BR|-21.1343|-47.7741|1805|159|1
RAP|KRAP|Rapid City||US|44.0453|-103.057|3204|95|1
RAS|OIGG|Sardar-e-Jangal|Rasht|IR|37.3233|49.6178|-40|247|1
RBY|PARY|Ruby||US|64.7272|-155.47|658|53|1
RCB|FARB|Richards Bay||ZA|-28.741|32.0921|109|24|1
RCH|SKRH|Almirante Padilla|Riohacha|CO|11.5262|-72.926|43|79|1
RDD|KRDD|Redding||US|40.509|-122.293|505|122|1
RDM|KRDM|Roberts Field|Redmond|US|44.2541|-121.15|3080|122|1
RDO|EPRA|Warsaw Radom||PL|51.3894|21.2147|610|327|1
RDP|VEDG|Kazi Nazrul Islam|Durgapur|IN|23.6225|87.243|300|0|1
RDZ|LFCR|Rodez–Aveyron|Rodez/Marcillac|FR|44.4079|2.4827|1910|309|1
REG|LICR|Reggio Calabria||IT|38.0712|15.6516|96|313|1
REL|SAVT|Almirante Marco Andres Zar|Rawson|AR|-43.2105|-65.2703|141|58|1
REN|UWOO|Orenburg Central||RU|51.7927|55.4572|387|257|1
RER|MGRT|Retalhuleu||GT|14.5214|-91.697|656|107|1
REW|VERW|Rewa Airport, Chorhata, REWA||IN|24.5034|81.2203|1000|0|1
REX|MMRX|General Lucio Blanco|Reynosa|MX|26.0089|-98.2285|139|128|1
RFD|KRFD|Chicago Rockford|Chicago/Rockford|US|42.1954|-89.0972|742|87|1
RFP|NTTR|Raiatea|Uturoa|PF|-16.7229|-151.466|3|368|1
RGA|SAWE|Gobernador Ramón Trejo Noel|Rio Grande|AR|-53.7777|-67.7494|65|68|1
RGI|NTTG|Rangiroa||PF|-14.9543|-147.661|10|368|1
RGO|ZKHM|Orang (Chongjin)|Hoemun-ri|KP|41.4285|129.648|12|233|1
RHD|SANR|Termas de Río Hondo international||AR|-27.4966|-64.936|935|59|1
RHI|KRHI|Rhinelander Oneida||US|45.6312|-89.4675|1624|87|1
RIA|SBSM|Santa Maria||BR|-29.7114|-53.6882|287|159|1
RIB|SLRI|Capitán Av. Selin Zeitun Lopez|Riberalta|BO|-11.0094|-66.0755|462|120|1
RIS|RJER|Rishiri||JP|45.242|141.186|112|249|1
RIW|KRIW|Central Wyoming|Riverton|US|43.0642|-108.46|5525|95|1
RIZ|ZSRZ|Rizhao Shanzihe|Rizhao (Donggang)|CN|35.405|119.324|121|0|1
RJA|VORY|Rajahmundry|Madhurapudi|IN|17.1058|81.8132|151|216|1
RJH|VGRJ|Shah Makhdum|Rajshahi|BD|24.4372|88.6165|64|199|1
RJN|OIKR|Rafsanjan||IR|30.2983|56.049|5298|247|1
RKD|KRKD|Knox County|Rockland|US|44.0601|-69.0992|56|139|1
RKE|EKRK|Copenhagen Roskilde||DK|55.5856|12.1314|146|288|1
RKS|KRKS|Southwest Wyoming|Rock Springs|US|41.5942|-109.065|6764|95|1
RKV|BIRK|Reykjavík||IS|64.1287|-21.9376|48|265|1
RLG|ETNL|Rostock-Laage||DE|53.9182|12.2783|138|282|1
RLK|ZBYZ|Bayannur Tianjitai||CN|40.9264|107.741|3400|241|1
RMA|YROM|Roma||AU|-26.545|148.775|1032|269|1
RMZ|USTJ|Tobolsk Remezov||RU|58.0597|68.348|167|0|1
RNB|ESDF|Ronneby||SE|56.2667|15.265|191|320|1
RNJ|RORY|Yoron||JP|27.0438|128.402|52|249|1
RNN|EKRN|Bornholm|Rønne|DK|55.0633|14.7596|52|288|1
RNS|LFRN|Rennes-Saint-Jacques|Saint-Jacques-de-la-Lande, Ille-et-Vilaine|FR|48.0695|-1.7348|124|309|1
ROA|KROA|Roanoke–Blacksburg||US|37.3255|-79.9754|1175|139|1
ROI|VTUV|Roi Et||TH|16.1168|103.774|451|190|1
ROK|YBRK|Rockhampton||AU|-23.38|150.475|34|269|1
ROO|SBRD|Maestro Marinho Franco|Rondonópolis|BR|-16.5843|-54.7248|1467|91|1
ROT|NZRO|Rotorua||NZ|-38.1092|176.317|935|340|1
ROW|KROW|Roswell Air Center||US|33.3016|-104.531|3671|95|1
RPR|VERP|Swami Vivekananda|Raipur|IN|21.1804|81.7388|1041|216|1
RQA|ZWRQ|Ruoqiang Loulan|Ruoqiang Town|CN|38.9747|88.0083|2916|241|1
RRG|FIMR|Sir Charles Gaetan Duval|Port Mathurin|MU|-19.7567|63.3593|95|336|1
RRJ|SBJR|Jacarepaguá - Roberto Marinho|Rio de Janeiro|BR|-22.9868|-43.3722|10|159|1
RRS|ENRO|Røros||NO|62.5784|11.3423|2054|308|1
RSA|SAZR|Santa Rosa||AR|-36.5883|-64.2757|630|64|1
RSD|MYER|Rock Sound||BS|24.8916|-76.1776|10|138|1
RST|KRST|Rochester||US|43.9083|-92.5|1317|87|1
RSU|RKJY|Yeosu||KR|34.8423|127.617|53|240|1
RUA|HUAR|Arua||UG|3.0492|30.9117|3951|26|1
RUR|NTAR|Rurutu||PF|-22.4341|-151.361|18|368|1
RUT|KRUT|Rutland - Southern Vermont||US|43.5294|-72.9496|787|139|1
RVK|ENRM|Rørvik Airport, Ryum||NO|64.8383|11.1461|14|308|1
RVY|SURV|Pres. Gral. Óscar D. Gestido Binational|Rivera/Santana do Livramento|UY|-30.9746|-55.4762|712|136|1
RWN|UKLR|Rivne||UA|50.6071|26.1416|755|298|1
RXS|RPVR|Roxas|Roxas City|PH|11.5977|122.752|10|224|1
RYK|OPRK|Shaikh Zaid|Rahim Yar Khan|PK|28.3839|70.2796|271|213|1
RZR|OINR|Ramsar||IR|36.907|50.6873|-70|247|1
SAB|TNCS|Juancho E. Yrausquin|Zion's Hill|BQ|17.6453|-63.2205|60|119|1
SAF|KSAF|Santa Fe||US|35.6171|-106.089|6348|95|1
SAQ|MYAN|San Andros|Andros Island|BS|25.0538|-78.049|5|138|1
SBA|KSBA|Santa Barbara||US|34.4262|-119.84|13|122|1
SBH|TFFJ|St. Jean|Gustavia|BL|17.9044|-62.8433|49|162|1
SBN|KSBN|South Bend||US|41.7083|-86.3169|799|113|1
SBP|KSBP|San Luis County|San Luis Obispo|US|35.2368|-120.642|212|122|1
SBT|USDA|Sabetta||RU|71.2192|72.0522|46|257|1
SBW|WBGS|Sibu||MY|2.2616|111.985|122|219|1
SBY|KSBY|Salisbury Ocean City Wicomico||US|38.3405|-75.5103|52|139|1
SCC|PASC|Deadhorse||US|70.1947|-148.465|65|53|1
SCE|KUNV|State College||US|40.8494|-77.8485|1239|139|1
SCK|KSCK|Stockton||US|37.8933|-121.238|33|122|1
SCN|EDDR|Saarbrücken||DE|49.2145|7.1097|1058|282|1
SCT|OYSQ|Socotra|Mori|YE|12.6321|53.9062|146|179|1
SCW|UUYY|Syktyvkar||RU|61.647|50.8451|342|307|1
SDD|FNUB|Lubango Mukanka||AO|-14.9248|13.5767|5778|33|1
SDE|SANE|Vicecomodoro Angel D. La Paz Aragonés|Santiago del Estero|AR|-27.7656|-64.31|656|59|1
SDG|OICS|Sanandaj||IR|35.2459|47.0092|4522|247|1
SDK|WBKS|Sandakan||MY|5.9009|118.059|46|219|1
SDL|ESNN|Sundsvall-Härnösand|Sundsvall/ Härnösand|SE|62.5281|17.4439|16|320|1
SDP|PASD|Sand Point||US|55.3139|-160.522|21|53|1
SDR|LEXJ|Seve Ballesteros-Santander||ES|43.4271|-3.82|16|303|1
SDS|RJSD|Sado||JP|38.0602|138.414|88|249|1
SDW|VOSR|Sindhudurg|Chipi|IN|16.0026|73.5298|203|0|1
SDY|KSDY|Sidney - Richland||US|47.7051|-104.194|1985|95|1
SEB|HLLS|Sabha||LY|26.9925|14.4662|1427|49|1
SEK|UESK|Srednekolymsk||RU|67.4805|153.736|60|0|1
SEN|EGMC|London Southend|Southend-on-Sea, Essex|GB|51.5706|0.6936|49|301|1
SFA|DTTX|Sfax Thyna||TN|34.718|10.691|85|50|1
SFG|TFFG|Grand Case-l'Espérance||MF|18.1001|-63.0474|7|123|1
SFJ|BGSF|Kangerlussuaq||GL|67.0104|-50.7153|165|142|1
SFN|SAAV|Sauce Viejo|Santa Fe|AR|-31.7117|-60.8117|55|59|1
SFT|ESNS|Skellefteå||SE|64.6248|21.0769|157|320|1
SGD|EKSB|Sønderborg||DK|54.9644|9.7917|24|288|1
SGF|KSGF|Springfield Branson||US|37.245|-93.3886|1268|87|1
SGU|KSGU|St George||US|37.0364|-113.51|2941|95|1
SHB|RJCN|Nakashibetsu||JP|43.5775|144.96|234|249|1
SHD|KSHD|Shenandoah Valley|Weyers Cave|US|38.2638|-78.8964|1201|139|1
SHI|RORS|Shimojishima|Miyakojima|JP|24.8267|125.145|54|249|1
SHL|VEBI|Shillong||IN|25.7036|91.9787|2910|216|1
SHM|RJBD|Nanki Shirahama||JP|33.6622|135.364|298|249|1
SHR|KSHR|Sheridan||US|44.7692|-106.98|4021|95|1
SHS|ZHJZ|Jingzhou Shashi|Jingzhou (Shashi)|CN|30.2928|112.448|95|241|1
SHV|KSHV|Shreveport||US|32.4447|-93.8267|258|87|1
SHW|OESH|Sharurah||SA|17.4669|47.1214|2363|237|1
SIG|TJIG|Fernando Luis Ribas Dominicci|San Juan|PR|18.4568|-66.0981|10|149|1
SIS|FASS|Sishen||ZA|-27.6486|22.9993|3848|24|1
SIT|PASI|Sitka Rocky Gutierrez||US|57.0471|-135.362|21|161|1
SJE|SKSJ|Jorge E. Gonzalez Torres|San José Del Guaviare|CO|2.5797|-72.6394|605|79|1
SJI|RPUH|San Jose||PH|12.3615|121.047|14|224|1
SJK|SBSJ|Professor Urbano Ernesto Stumpf|São José Dos Campos|BR|-23.2292|-45.8615|2120|159|1
SJL|SBUA|São Gabriel da Cachoeira||BR|-0.1484|-66.9855|249|126|1
SJP|SBSR|Prof. Eribelto Manoel Reino State|São José do Rio Preto|BR|-20.8171|-49.407|1784|159|1
SJT|KSJT|San Angelo Regional Mathis Field||US|31.3577|-100.496|1919|87|1
SJZ|LPSJ|São Jorge|Velas|PT|38.6655|-28.1758|311|259|1
SKN|ENSK|Stokmarknes Airport, Skagen|Hadsel|NO|68.5788|15.0334|11|308|1
SKZ|OPSK|Begum Nusrat Bhutto International Airport Sukkur||PK|27.722|68.7917|196|213|1
SLD|LZSL|Sliač||SK|48.6378|19.1341|1043|283|1
SLE|KSLE|Salem-Willamette Valley Airport/McNary Field||US|44.9095|-123.003|214|122|1
SLK|KSLK|Adirondack|Saranac Lake|US|44.3869|-74.2046|1663|139|1
SLM|LESA|Salamanca||ES|40.9521|-5.502|2595|303|1
SLN|KSLN|Salina||US|38.791|-97.6522|1288|87|1
SLP|MMSP|Ponciano Arriaga|San Luis Potosí|MX|22.262|-100.936|6035|132|1
SLU|TLPC|George F. L. Charles|Castries|LC|14.0202|-60.9929|22|165|1
SLW|MMIO|Plan de Guadalupe|Saltillo|MX|25.5379|-100.928|4778|135|1
SLY|USDD|Salekhard||RU|66.5908|66.611|218|257|1
SMA|LPAZ|Santa Maria|Vila do Porto|PT|36.9714|-25.1706|308|259|1
SMI|LGSM|Samos|Samos Island|GR|37.69|26.9117|19|280|1
SML|MYLS|Stella Maris||BS|23.5823|-75.2686|10|138|1
SMN|KSMN|Lemhi|Salmon|US|45.1222|-113.882|4043|80|1
SMR|SKSM|Simón Bolívar|Santa Marta|CO|11.1196|-74.2306|22|79|1
SMS|FMMS|Sainte Marie|Vohilava|MG|-17.0939|49.8158|7|330|1
SMW|GMMA|Smara||EH|26.732|-11.6837|350|20|1
SMX|KSMX|Santa Maria Public Airport Captain G Allan Hancock Field||US|34.8989|-120.457|261|122|1
SNB|YSNK|Snake Bay|Milikapiti|AU|-11.4177|130.649|173|271|1
SNE|GVSN|Preguiça||CV|16.5889|-24.2841|669|262|1
SNO|VTUI|Sakon Nakhon||TH|17.1951|104.119|529|190|1
SNP|PASN|St Paul Island||US|57.1663|-170.223|63|140|1
SNR|LFRZ|Saint-Nazaire-Montoir|Saint-Nazaire/Montoir|FR|47.3114|-2.1526|13|309|1
SNV|SVSE|Santa Elena de Uairén||VE|4.5547|-61.1452|2938|84|1
SNW|VYTD|Thandwe||MM|18.4607|94.3001|20|256|1
SOB|LHSM|Hévíz–Balaton|Sármellék|HU|46.6864|17.1591|408|286|1
SOJ|ENSR|Sørkjosen||NO|69.7868|20.9594|16|308|1
SOM|SVST|San Tomé|El Tigre|VE|8.9451|-64.1511|861|84|1
SON|NVSS|Santo Pekoa|Luganville|VU|-15.505|167.22|184|345|1
SOQ|WASS|Domine Eduard Osok|Sorong|ID|-0.894|131.287|10|209|1
SOU|EGHI|Southampton||GB|50.9503|-1.3568|44|301|1
SOW|KSOW|Show Low||US|34.2641|-110.007|6415|145|1
SPC|GCLA|La Palma|Sta Cruz de la Palma, La Palma Island|ES|28.6265|-17.7556|107|261|1
SPD|VGSD|Saidpur||BD|25.7592|88.9089|125|199|1
SPI|KSPI|Abraham Lincoln Capital|Springfield|US|39.8441|-89.6779|598|87|1
SPN|PGSN|Saipan|I Fadang, Saipan|MP|15.1194|145.729|215|367|1
SPP|FNME|Menongue||AO|-14.6576|17.7198|4469|33|1
SPR|MZSP|John Greif II|San Pedro|BZ|17.9139|-87.9711|4|0|1
SPS|KSPS|Wichita Falls Municipal Airport / Sheppard Air Force Base||US|33.9888|-98.4919|1019|87|1
SPY|DISP|San Pedro||CI|4.7467|-6.6608|26|1|1
SQD|ZSSR|Shangrao Sanqingshan|Shangrao (Hengfeng)|CN|28.3797|117.964|340|121|1
SQG|WIOS|Tebelian|Sintang|ID|-0.0452|111.458|97|232|1
SQJ|ZSSM|Sanming Shaxian|Sanming (Sha)|CN|26.4263|117.834|830|241|1
SQL|KSQL|San Carlos||US|37.5131|-122.251|5|122|1
SRP|ENSO|Stord Airport, Sørstokken|Leirvik|NO|59.7919|5.3408|160|308|1
SRT|HUSO|Soroti||UG|1.7277|33.6228|3697|26|1
SRY|OINZ|Sari Dasht-e Naz||IR|36.6444|53.1888|35|247|1
SRZ|SLET|El Trompillo|Santa Cruz|BO|-17.8116|-63.1715|1371|120|1
SSJ|ENST|Sandnessjøen Airport, Stokka|Alstahaug|NO|65.9568|12.4689|56|308|1
SST|SAZL|Santa Teresita||AR|-36.5423|-56.7218|9|57|1
SSY|FNBC|Mbanza Congo||AO|-6.2699|14.247|1860|33|1
STC|KSTC|Saint Cloud||US|45.5466|-94.0599|1031|87|1
STD|SVSO|Mayor Buenaventura Vivas|Santo Domingo|VE|7.5654|-72.0351|1083|84|1
STG|PAPB|St George||US|56.5773|-169.664|125|140|1
STM|SBSN|Santarém - Maestro Wilson Fonseca||BR|-2.4224|-54.7931|198|156|1
STS|KSTS|Charles M. Schulz Sonoma|Santa Rosa|US|38.509|-122.813|128|122|1
STW|URMT|Stavropol Shpakovskoye||RU|45.1092|42.1128|1486|307|1
STX|TISX|Henry E. Rohlsen|Christiansted|VI|17.7014|-64.8026|74|166|1
SUG|RPMS|Surigao|Surigao City|PH|9.7558|125.481|20|224|1
SUI|UGSS|Vladislav Ardzinba Sukhum|Sukhumi|GE|42.8582|41.1281|53|246|1
SUJ|LRSM|Satu Mare||RO|47.7033|22.8857|405|285|1
SUN|KSUN|Friedman Memorial|Hailey|US|43.5044|-114.296|5318|80|1
SUX|KSUX|Sioux Gateway Airport / Brigadier General Bud Day Field|Sioux City|US|42.3976|-96.3822|1098|87|1
SVA|PASA|Savoonga||US|63.6864|-170.493|53|140|1
SVB|FMNS|Sambava||MG|-14.2786|50.1747|20|330|1
SVC|KSVC|Grant|Silver City|US|32.6367|-108.155|5446|95|1
SVI|SKSV|Eduardo Falla Solano|San Vicente Del Caguán|CO|2.1522|-74.7663|920|79|1
SVJ|ENSH|Svolvær Airport, Helle||NO|68.2433|14.6692|27|308|1
SVL|EFSA|Savonlinna||FI|61.9431|28.9451|311|292|1
SVZ|SVSA|Juan Vicente Gómez|San Antonio del Tachira|VE|7.8408|-72.4399|1312|79|1
SWF|KSWF|New York Stewart|Newburgh|US|41.5042|-74.1089|491|139|1
SWO|KSWO|Stillwater||US|36.1621|-97.0856|1000|87|1
SYO|RJSY|Shonai||JP|38.8122|139.787|86|249|1
SYQ|MRPV|Tobías Bolaños|San Jose|CR|9.9571|-84.1398|3287|90|1
SYS|UERS|Saskylakh||RU|71.9279|114.08|0|255|1
SYY|EGPO|Stornoway|Stornoway, Western Isles|GB|58.2156|-6.3311|26|301|1
SZA|FNSO|Soyo||AO|-6.1411|12.3718|15|33|1
SZF|LTFH|Samsun-Çarşamba||TR|41.254|36.5675|18|294|1
SZH|ZBSG|Shuozhou Zirun||CN|39.2732|112.692|0|241|1
SZK|FASZ|Skukuza||ZA|-24.9609|31.5886|1020|24|1
SZY|EPSY|Olsztyn-Mazury|Szymany|PL|53.4819|20.9377|463|327|1
TAC|RPVA|Daniel Z. Romualdez|Tacloban City|PH|11.2278|125.028|10|224|1
TAH|NVVW|Whitegrass|Tanna Island|VU|-19.4551|169.224|19|345|1
TAI|OYTZ|Taiz||YE|13.686|44.1391|4838|179|1
TAM|MMTM|General Francisco Javier Mina|Ciudad Madero|MX|22.2926|-97.8671|80|135|1
TAP|MMTP|Tapachula||MX|14.7945|-92.3699|97|132|1
TAT|LZTT|Poprad-Tatry||SK|49.071|20.2414|2356|283|1
TAY|EETU|Tartu||EE|58.3074|26.6865|220|321|1
TBB|VVTH|Dong Tac|Tuy Hoa|VN|13.0496|109.334|20|204|1
TBH|RPVU|Tugdan|Tablas Island|PH|12.311|122.085|10|224|1
TBI|MYCB|New Bight|Cat Island|BS|24.3153|-75.4523|5|138|1
TBJ|DTKA|Tabarka-Aïn Draham||TN|36.98|8.8769|230|50|1
TBN|KTBN|Waynesville-St. Robert Regional Airport-Forney Field|Fort Leonard Wood|US|37.7416|-92.1407|1159|87|1
TBP|SPME|Captain Pedro Canga Rodríguez|Tumbes|PE|-3.5521|-80.3811|115|121|1
TBT|SBTT|Tabatinga||BR|-4.2557|-69.9358|263|79|1
TCA|YTNK|Tennant Creek||AU|-19.6344|134.183|1236|271|1
TCB|MYAT|Treasure Cay||BS|26.7453|-77.3913|8|138|1
TCO|SKCO|La Florida|Tumaco|CO|1.8144|-78.7492|8|79|1
TCP|HETB|Taba||EG|29.5945|34.7758|2425|13|1
TCQ|SPTN|Coronel FAP Carlos Ciriani Santa Rosa|Tacna|PE|-18.0533|-70.2758|1538|121|1
TCZ|ZPTC|Tengchong Tuofeng|Baoshan (Tengchong)|CN|24.9381|98.4858|6250|241|1
TDD|SLTR|Teniente Av. Jorge Henrich Arauz|Trinidad|BO|-14.8187|-64.918|509|120|1
TDK|UAAT|Taldykorgan||KZ|45.1225|78.4428|1925|180|1
TDX|VTBO|Trat|Laem Ngop|TH|12.2746|102.319|105|190|1
TEB|KTEB|Teterboro||US|40.8501|-74.0608|9|139|1
TEE|DABS|Cheikh Larbi Tébessi||DZ|35.4316|8.1207|2661|4|1
TEN|ZUTR|Tongren Fenghuang|Tongren (Daxing)|CN|27.8833|109.309|0|241|1
TEQ|LTBU|Tekirdağ Çorlu||TR|41.1382|27.9191|574|294|1
TER|LPLA|Lajes|Praia da Vitória|PT|38.7618|-27.0908|180|259|1
TEX|KTEX|Telluride||US|37.9538|-107.908|9070|95|1
TEZ|VETZ|Tezpur||IN|26.7091|92.7847|240|216|1
TFF|SBTF|Tefé||BR|-3.3829|-64.7241|186|126|1
TGG|WMKN|Sultan Mahmud|Kuala Terengganu|MY|5.3826|103.103|21|218|1
TGJ|NWWA|Tiga||NC|-21.0964|167.804|128|361|1
TGK|URRT|Taganrog Yuzhny||RU|47.1983|38.8492|117|307|1
TGM|LRTM|Târgu Mureş Transilvania|Recea|RO|46.4677|24.4125|963|285|1
TGO|ZBTL|Tongliao||CN|43.5567|122.2|2395|241|1
TGR|DAUK|Touggourt Sidi Madhi||DZ|33.0678|6.0887|279|4|1
TGT|HTTG|Tanga||TZ|-5.0924|39.0712|129|17|1
TGU|MHTG|Toncontín|Tegucigalpa|HN|14.0609|-87.2172|3294|169|1
TGZ|MMTG|Angel Albino Corzo|Tuxtla Gutiérrez|MX|16.5616|-93.0257|1499|132|1
THE|SBTE|Senador Petrônio Portela|Teresina|BR|-5.0602|-42.8237|219|101|1
THG|YTNG|Thangool|Biloela|AU|-24.4949|150.578|644|269|1
THL|VYTL|Tachileik||MM|20.4838|99.9354|1280|256|1
THN|ESGT|Trollhättan-Vänersborg||SE|58.3181|12.345|137|320|1
THQ|ZLTS|Tianshui Maijishan|Tianshui (Maiji)|CN|34.5601|105.86|3590|241|1
THS|VTPO|Sukhothai||TH|17.238|99.8182|179|190|1
THU|BGTL|Pituffik Space Base||GL|76.5306|-68.7005|251|170|1
TIH|NTGC|Tikehau|Tuherahera|PF|-15.1196|-148.231|6|368|1
TIM|WAYY|Mozes Kilangin|Timika|ID|-4.5298|136.887|103|209|1
TIN|DAOF|Tindouf||DZ|27.7004|-8.1671|1453|4|1
TIQ|PGWT|Francisco Manglona Borja / Tinian|Tinian Island|MP|14.9992|145.619|271|367|1
TIU|NZTU|Timaru||NZ|-44.3028|171.225|89|340|1
TIV|LYTV|Tivat||ME|42.4047|18.7233|20|310|1
TIW|KTIW|Tacoma Narrows||US|47.2674|-122.577|294|122|1
TJA|SLTJ|Capitan Oriel Lea Plaza|Tarija|BO|-21.5557|-64.7013|6079|120|1
TJG|WAON|Warukin|Tanta-Tabalong|ID|-2.2166|115.436|197|223|1
TJH|RJBT|Konotori Tajima|Toyooka|JP|35.5128|134.787|584|249|1
TJK|LTAW|Tokat||TR|40.3247|36.3906|1859|294|1
TKD|DGTK|Takoradi|Sekondi-Takoradi|GH|4.8961|-1.7748|21|2|1
TKF|KTRK|Truckee Tahoe||US|39.3186|-120.141|5900|122|1
TKG|WILL|Radin Inten II|Bandar Lampung|ID|-5.2468|105.183|282|208|1
TKN|RJKN|Tokunoshima|Amagi|JP|27.8364|128.881|17|249|1
TKP|NTGT|Takapoto||PF|-14.7095|-145.246|12|368|1
TKX|NTKR|Takaroa||PF|-14.4558|-145.025|13|368|1
TLE|FMST|Toliara||MG|-23.3834|43.7285|29|330|1
TLH|KTLH|Tallahassee||US|30.4012|-84.3543|81|139|1
TLN|LFTH|Toulon-Hyères|Hyères, Var|FR|43.0973|6.146|7|309|1
TLQ|ZWTL|Turpan Jiaohe||CN|43.0308|89.0987|934|241|1
TME|SKTM|Gustavo Vargas|Tame|CO|6.4511|-71.7603|1050|79|1
TMH|WAKT|Tanah Merah||ID|-6.0967|140.304|57|209|1
TMJ|UZST|Termez||UZ|37.2873|67.3119|1027|239|1
TMT|SBTB|Trombetas|Oriximiná|BR|-1.4896|-56.3968|167|156|1
TMW|YSTW|Tamworth||AU|-31.0779|150.845|1334|277|1
TMX|DAUT|Timimoun||DZ|29.2371|0.276|1027|4|1
TND|MUTD|Alberto Delgado|Trinidad|CU|21.7883|-79.9972|125|111|1
TNE|RJFG|New Tanegashima||JP|30.6051|130.991|768|249|1
TNH|ZYTN|Tonghua Sanyuanpu||CN|42.0484|125.734|1347|241|1
TNJ|WIDN|Raja Haji Fisabilillah|Tanjung Pinang-Bintan Island|ID|0.924|104.533|52|208|1
TOD|WMBT|Tioman|Tioman Island|MY|2.8182|104.16|15|218|1
TOE|DTTZ|Tozeur Nefta||TN|33.9397|8.1106|287|50|1
TOL|KTOL|Eugene F. Kranz Toledo Express||US|41.5868|-83.8078|683|139|1
TOU|NWWU|Touho||NC|-20.7901|165.26|10|361|1
TOY|RJNT|Toyama Kitokito||JP|36.6484|137.187|95|249|1
TPJ|VNTJ|Taplejung||NP|27.3509|87.6953|7990|214|1
TPP|SPST|Cadete FAP Guillermo Del Castillo Paredes|Tarapoto|PE|-6.5087|-76.3732|869|121|1
TPQ|MMEP|Amado Nervo|Tepic|MX|21.4198|-104.843|3020|129|1
TPS|LICT|Vincenzo Florio Airport Trapani-Birgi|Trapani (TP)|IT|37.9114|12.488|25|313|1
TRA|RORT|Tarama||JP|24.6538|124.675|36|249|1
TRC|MMTC|Francisco Sarabia Tinoco|Torreón|MX|25.5623|-103.405|3688|135|1
TRE|EGPU|Tiree|Balemartine, Argyll and Bute|GB|56.4992|-6.8692|38|301|1
TRG|NZTG|Tauranga||NZ|-37.6719|176.196|13|340|1
TRI|KTRI|Tri-Cities Regional TN/VA|Blountville|US|36.4752|-82.4074|1519|139|1
TRK|WAQQ|Juwata International Airport / Suharnoko Harbani AFB|Tarakan|ID|3.3251|117.564|23|223|1
TRR|VCCT|China Bay|Trincomalee|LK|8.5392|81.1813|6|197|1
TRT|WAFB|Toraja||ID|-3.1844|119.919|2884|0|1
TSJ|RJDT|Tsushima||JP|34.2849|129.331|213|249|1
TSM|KSKX|Taos||US|36.4525|-105.677|7095|95|1
TST|VTST|Trang||TH|7.5087|99.6166|67|190|1
TSV|YBTL|Townsville Airport / RAAF Base Townsville||AU|-19.2529|146.767|18|269|1
TTA|GMAT|Tan Tan||MA|28.4476|-11.1617|653|14|1
TTE|WAEE|Sultan Babullah|Ternate|ID|0.831|127.382|49|209|1
TTJ|RJOR|Tottori Sand Dunes Conan||JP|35.5301|134.165|65|249|1
TTN|KTTN|Trenton Mercer|Ewing Township|US|40.2767|-74.8135|213|139|1
TTT|RCFN|Taitung|Taitung City|TW|22.7549|121.102|143|244|1
TUA|SETU|Lieutenant Colonel Luis A. Mantilla|Tulcán|EC|0.8095|-77.7081|9649|108|1
TUB|NTAT|Tubuai||PF|-23.3654|-149.524|7|368|1
TUF|LFOT|Tours Val de Loire|Tours, Indre-et-Loire|FR|47.4322|0.7276|357|309|1
TUG|RPUT|Tuguegarao|Tuguegarao City|PH|17.6434|121.733|70|224|1
TUI|OETR|Turaif||SA|31.6922|38.7315|2803|237|1
TUO|NZAP|Taupo||NZ|-38.7397|176.084|1335|340|1
TUP|KTUP|Tupelo||US|34.2681|-88.7699|346|87|1
TUR|SBTU|Tucuruí||BR|-3.786|-49.7203|830|75|1
TVC|KTVC|Cherry Capital|Traverse City|US|44.7414|-85.5822|624|96|1
TVF|KTVF|Thief River Falls||US|48.0657|-96.185|1119|87|1
TVT|UZTP|Tashkent-Khumo||UZ|41.3129|69.3955|1574|245|1
TVY|VYDW|Dawei||MM|14.1039|98.2036|84|256|1
TWF|KTWF|Joslin Field Magic Valley|Twin Falls|US|42.4818|-114.488|4154|80|1
TWT|RPMN|Sanga Sanga|Bongao|PH|5.0482|119.743|15|224|1
TWU|WBKW|Tawau||MY|4.3134|118.121|57|219|1
TXE|WITK|Rembele|Takengon|ID|4.7211|96.8519|4648|0|1
TXK|KTXK|Texarkana Regional Airport (Webb Field)||US|33.4537|-93.991|390|87|1
TYF|ESST|Torsby||SE|60.1576|12.9913|393|320|1
TYL|SPYL|Captain Victor Montes Arias|Talara|PE|-4.5766|-81.2541|282|121|1
TYR|KTYR|Tyler Pounds||US|32.3541|-95.4024|544|87|1
TZA|MZBE|Sir Barry Bowen|Belize City|BZ|17.5172|-88.1958|8|0|1
TZN|MYAK|Congo Town|Andros|BS|24.1587|-77.5898|15|138|1
TZX|LTCG|Trabzon||TR|40.9951|39.7897|104|294|1
UAI|WPDB|Commander in Chief of FALINTIL, Kay Rala Xanana Gusmão,|Suai|TL|-9.3019|125.286|96|200|1
UAQ|SANU|Domingo Faustino Sarmiento|San Juan|AR|-31.5715|-68.4182|1958|65|1
UAR|GMFB|Bouarfa||MA|32.5143|-1.9831|3630|14|1
UBA|SBUR|Mário de Almeida Franco|Uberaba|BR|-19.765|-47.9648|2655|159|1
UBJ|RJDC|Yamaguchi Ube||JP|33.93|131.279|23|249|1
UBP|VTUU|Ubon Ratchathani||TH|15.2513|104.87|406|190|1
UCB|ZBUC|Ulanqab Jining||CN|41.1303|113.107|0|241|1
UCT|UUYH|Ukhta||RU|63.5669|53.8047|482|307|1
UDI|SBUL|Ten. Cel. Aviador César Bombonato|Uberlândia|BR|-18.8836|-48.2259|3094|159|1
UDR|VAUD|Maharana Pratap|Udaipur|IN|24.6177|73.8961|1684|216|1
UEL|FQQL|Quelimane||MZ|-17.8555|36.8691|36|37|1
UEO|ROKJ|Kumejima||JP|26.3634|126.714|23|249|1
UGA|ZMBN|Bulgan||MN|48.855|103.476|4311|251|1
UGU|WAYB|Bilorai|Bilogai|ID|-3.7395|137.031|7348|0|1
UIB|SKUI|El Caraño|Quibdó|CO|5.6908|-76.6412|204|79|1
UIH|VVPC|Phu Cat|Quy Nohn|VN|13.955|109.042|80|204|1
UIN|KUIN|Quincy Regional Airport Baldwin Field||US|39.9427|-91.1946|768|87|1
UKE|VEUK|Utkela|Bhawanipatna|IN|20.0978|83.1833|685|216|1
UKX|UITT|Ust-Kut||RU|56.8567|105.73|2188|207|1
ULG|ZMUL|Ölgii Mongolei||MN|48.9933|89.9225|5732|206|1
ULK|UERL|Lensk||RU|60.7236|114.825|801|255|1
ULO|ZMUG|Ulaangom||MN|50.0666|91.9383|5676|206|1
ULP|YQLP|Quilpie||AU|-26.6092|144.254|655|269|1
ULU|HUGU|Gulu||UG|2.8056|32.2718|3510|26|1
ULV|UWLL|Ulyanovsk Baratayevka||RU|54.2702|48.2256|449|323|1
ULY|UWLW|Ulyanovsk Vostochny|Cherdakly|RU|54.401|48.8027|252|323|1
UNI|TVSU|Union Island||VC|12.6001|-61.4119|16|167|1
UNK|PAUN|Unalakleet||US|63.8884|-160.799|27|53|1
UNN|VTSR|Ranong||TH|9.7776|98.5855|57|190|1
UPN|MMPN|Uruapan - Licenciado y General Ignacio Lopez Rayon||MX|19.3967|-102.039|5258|132|1
URE|EEKE|Kuressaare||EE|58.2299|22.5095|14|321|1
URG|SBUG|Rubem Berta|Uruguaiana|BR|-29.7822|-57.0382|256|159|1
URJ|USHU|Uray||RU|60.1033|64.8267|190|257|1
URS|UUOK|Kursk East||RU|51.7506|36.2956|686|307|1
URT|VTSB|Surat Thani||TH|9.1326|99.1356|20|190|1
URY|OEGT|Gurayat||SA|31.4124|37.2789|1672|237|1
USA|KJQF|Concord-Padgett||US|35.3878|-80.7091|705|139|1
USH|SAWH|Ushuaia - Malvinas Argentinas||AR|-54.8433|-68.2958|102|68|1
USK|UUYS|Usinsk||RU|66.0047|57.3672|262|307|1
USN|RKPU|Ulsan||KR|35.5935|129.352|45|240|1
USR|UEMT|Ust-Nera||RU|64.55|143.115|1805|252|1
UST|KSGJ|Northeast Florida|St Augustine|US|29.9592|-81.3398|10|139|1
USU|RPVV|Francisco B. Reyes (Busuanga)|Coron|PH|12.1219|120.101|148|224|1
UTN|FAUP|Upington||ZA|-28.4002|21.2636|2782|24|1
UTO|PAIM|Indian Mountain LRRS|Utopia Creek|US|65.9928|-153.704|1273|53|1
UTT|FAUT|K. D. Matanzima|Mthatha|ZA|-31.5464|28.6734|2400|24|1
UUA|UWKB|Bugulma||RU|54.6412|52.8002|991|307|1
UVE|NWWV|Ouvéa||NC|-20.6409|166.573|23|361|1
UYL|HSNN|Nyala||SD|12.0535|24.9562|2106|27|1
UYN|ZLYL|Yulin Yuyang||CN|38.3597|109.591|3891|241|1
VAI|AYVN|Vanimo||PG|-2.6926|141.303|10|365|1
VAM|VRMV|Villa International Airport Maamigili||MV|3.4718|72.8326|6|335|1
VAN|LTCI|Van Ferit Melen||TR|38.4682|43.3323|5480|294|1
VAQ|UNIW|Vanavara||RU|60.3562|102.31|892|217|1
VAS|LTAR|Sivas Nuri Demirağ||TR|39.8138|36.9035|5239|294|1
VAW|ENSS|Vardø Airport, Svartnes||NO|70.3554|31.0449|42|308|1
VBS|LIPO|Brescia Gabriele d'Annunzio|Montichiari (BS)|IT|45.4289|10.3306|355|313|1
VCS|VVCS|Con Dao||VN|8.7318|106.633|20|204|1
VCT|KVCT|Victoria||US|28.8526|-96.9185|115|87|1
VDC|SBVC|Glauber de Andrade Rocha|Vitória da Conquista|BR|-14.9079|-40.9148|2940|72|1
VDE|GCHI|El Hierro|El Hierro Island|ES|27.8148|-17.8871|103|261|1
VDH|VVDH|Dong Hoi||VN|17.515|106.591|59|190|1
VDM|SAVV|Gobernador Castello|Viedma / Carmen de Patagones|AR|-40.8692|-63.0004|20|64|1
VDO|VVVD|Van Don||VN|21.1207|107.415|24|190|1
VDS|ENVD|Vadsø||NO|70.0653|29.8447|127|308|1
VDZ|PAVD|Valdez Pioneer Field||US|61.1327|-146.247|121|53|1
VEL|KVEL|Vernal||US|40.4362|-109.512|5278|95|1
VEO|UNIS|Severo-Yeniseysk||RU|60.3733|93.0117|1706|217|1
VGO|LEVX|Vigo||ES|42.2318|-8.6268|856|303|1
VHM|ESNV|Vilhelmina South Lapland||SE|64.5791|16.8336|1140|320|1
VIG|SVVG|Juan Pablo Pérez Alfonso|El Vigía|VE|8.6241|-71.6727|250|84|1
VII|VVVH|Vinh||VN|18.7376|105.671|23|190|1
VIJ|TUPW|Virgin Gorda|Spanish Town|VG|18.4466|-64.4279|9|173|1
VIT|LEVT|Vitoria|Alava|ES|42.8828|-2.7245|1682|303|1
VKG|VVRG|Rach Gia||VN|9.958|105.132|7|204|1
VKT|UUYW|Vorkuta||RU|67.4886|63.9931|604|307|1
VLD|KVLD|Valdosta||US|30.7825|-83.2767|203|139|1
VLL|LEVD|Valladolid||ES|41.7061|-4.8519|2776|303|1
VLV|SVVL|Dr. Antonio Nicolás Briceño|Valera|VE|9.3405|-70.5841|2060|84|1
VMU|AYBA|Baimuru||PG|-7.497|144.822|27|365|1
VNX|FQVL|Vilankulo|Vilanculo|MZ|-22.0184|35.3133|46|37|1
VOL|LGBL|Nea Anchialos||GR|39.2196|22.7943|83|280|1
VOZ|UUOO|Voronezh||RU|51.8143|39.2309|514|307|1
VPE|FNGI|Ngjiva Pereira|Ngiva|AO|-17.0435|15.6838|3566|33|1
VPN|BIVO|Vopnafjörður||IS|65.7206|-14.8506|16|265|1
VPS|KVPS|Destin-Fort Walton Beach|Valparaiso|US|30.4813|-86.5158|87|87|1
VPY|FQCH|Chimoio||MZ|-19.1513|33.429|2287|37|1
VQS|TJVQ|Antonio Rivera Rodriguez|Vieques|PR|18.1348|-65.4936|49|149|1
VRB|KVRB|Vero Beach||US|27.6556|-80.4179|24|139|1
VRC|RPUV|Virac||PH|13.5764|124.206|121|224|1
VRL|LPVR|Vila Real||PT|41.2743|-7.7205|1805|299|1
VSE|LPVZ|Aerodromo Goncalves Lobato (Viseu Airport)||PT|40.7255|-7.889|2060|299|1
VTU|MUVT|Hermanos Ameijeiras|Las Tunas|CU|20.9876|-76.9358|328|111|1
VUP|SKVP|Alfonso López Pumarejo|Valledupar|CO|10.435|-73.2495|483|79|1
VUS|ULWU|Velikiy Ustyug||RU|60.7883|46.26|331|307|1
VVC|SKVV|Vanguardia|Villavicencio|CO|4.1679|-73.6138|1394|79|1
VVZ|DAAP|Illizi Takhamalt||DZ|26.7235|8.6227|1778|4|1
VXC|FQLC|Lichinga||MZ|-13.274|35.2663|4505|37|1
VXO|ESMX|Växjö Kronoberg||SE|56.9291|14.728|610|320|1
VYI|UENW|Vilyuisk||RU|63.7567|121.693|361|255|1
WAE|OEWD|Wadi Al Dawasir||SA|20.5043|45.1996|2062|237|1
WAG|NZWU|Wanganui||NZ|-39.9635|175.024|27|340|1
WBM|AYWD|Wapenamanda||PG|-5.6353|143.892|5889|365|1
WDS|ZHSY|Shiyan Wudangshan|Shiyan (Maojian)|CN|32.5929|110.906|0|0|1
WEF|ZSWF|Weifang Nanyuan|Weifang (Kuiwen)|CN|36.6467|119.119|0|241|1
WEH|ZSWH|Weihai Dashuibo||CN|37.1871|122.229|145|241|1
WEI|YBWP|Weipa||AU|-12.6775|141.923|63|269|1
WGA|YSWG|Wagga Wagga|Forest Hill|AU|-35.1635|147.468|724|277|1
WGE|YWLG|Walgett||AU|-30.0328|148.126|439|277|1
WGN|ZGSY|Shaoyang Wugang|Shaoyang (Wugang)|CN|26.8061|110.641|1444|0|1
WHA|ZSWA|Wuhu Xuanzhou||CN|31.1045|118.667|80|241|1
WHK|NZWK|Whakatāne||NZ|-37.9222|176.917|20|340|1
WIC|EGPC|Wick John O'Groats||GB|58.4589|-3.0931|126|301|1
WIL|HKNW|Nairobi Wilson||KE|-1.3217|36.8148|5536|42|1
WIN|YWTN|Winton||AU|-22.3636|143.086|638|269|1
WJR|HKWJ|Wajir||KE|1.7332|40.0916|770|42|1
WJU|RKNW|Wonju Airport / Hoengseong Air Base (K-38/K-46)||KR|37.4371|127.96|329|240|1
WKA|NZWF|Wanaka||NZ|-44.7221|169.246|1142|340|1
WKJ|RJCW|Wakkanai||JP|45.4042|141.801|30|249|1
WKK||Aleknagik / New||US|59.2826|-158.618|66|0|1
WMN|FMNR|Maroantsetra||MG|-15.4377|49.6891|9|330|1
WMT|ZUMT|Zunyi Maotai||CN|27.9618|106.435|4068|241|1
WMX|WAVV|Wamena||ID|-4.0973|138.952|5435|209|1
WNI|WAWD|Matahora|Wangi-wangi Island|ID|-5.2921|123.636|88|0|1
WNP|RPUN|Naga||PH|13.5849|123.27|142|224|1
WNR|YWDH|Windorah||AU|-25.4106|142.668|452|269|1
WNS|OPNH|Shaheed Benazirabad|Nawabashah|PK|26.2194|68.3901|95|213|1
WOS|ZKWS|Wonsan Kalma||KP|39.1652|127.488|7|0|1
WRE|NZWR|Whangarei||NZ|-35.7693|174.364|133|340|1
WRG|PAWG|Wrangell||US|56.4843|-132.37|49|161|1
WST|KWST|Westerly State||US|41.3496|-71.8034|81|139|1
WSZ|NZWS|Westport||NZ|-41.7371|171.579|13|340|1
WUA|ZBUH|Wuhai||CN|39.7934|106.799|3650|241|1
WUN|YWLU|Wiluna||AU|-26.6327|120.222|1649|276|1
WUS|ZSWY|Nanping Wuyishan||CN|27.7019|118.001|614|241|1
WUU|HSWW|Wau||SS|7.7258|27.975|1529|25|1
WUZ|ZGWZ|Wuzhou Xijiang|Tangbu|CN|23.4032|111.093|357|241|1
WWK|AYWK|Wewak||PG|-3.5838|143.669|19|365|1
WYA|YWHA|Whyalla||AU|-33.0589|137.514|41|268|1
WYS|KWYS|Yellowstone|West Yellowstone|US|44.6884|-111.118|6649|95|1
XAI|ZHXY|Xinyang Minggang||CN|32.5408|114.079|312|241|1
XAP|SBCH|Serafin Enoss Bertaso|Chapecó|BR|-27.1342|-52.6566|2154|159|1
XCH|YPXM|Christmas Island|Flying Fish Cove|CX|-10.4504|105.691|916|331|1
XCR|LFOK|Chalons Vatry airport|Chalons en Champagne|FR|48.7733|4.2061|587|309|1
XFN|ZHXF|Xiangyang Liuji|Xiangyang (Xiangzhou)|CN|32.1522|112.292|234|241|1
XIC|ZUXC|Xichang Qingshan|Liangshan (Xichang)|CN|27.9891|102.184|5112|241|1
XIL|ZBXH|Xilinhot||CN|43.9156|115.964|0|241|1
XKS|CYAQ|Kasabonika||CA|53.5247|-88.6428|672|176|1
XMH|NTGI|Manihi||PF|-14.4368|-146.07|14|368|1
XMS|SEMC|Coronel E Carvajal|Macas|EC|-2.2992|-78.1208|3452|108|1
XNA|KXNA|Northwest Arkansas|Fayetteville/Springdale/Rogers|US|36.2819|-94.3068|1287|87|1
XQP|MRQP|Quepos Managua||CR|9.4432|-84.1298|85|90|1
XQU|CAT4|Qualicum Beach||CA|49.3375|-124.393|191|174|1
XRY|LEJR|Jerez|Jerez de la Frontera|ES|36.7446|-6.0601|93|303|1
XSC|MBSC|South Caicos||TC|21.5157|-71.5285|6|104|1
XSP|WSSL|Seletar||SG|1.4156|103.867|36|218|1
XTG|YTGM|Thargomindah||AU|-27.9864|143.812|433|269|1
XUZ|ZSXZ|Xuzhou Guanyin||CN|34.0591|117.555|108|241|1
XWA|KXWA|Williston Basin||US|48.2609|-103.751|2344|87|1
YAA|CAJ4|Anahim Lake||CA|52.4515|-125.304|3635|174|1
YAG|CYAG|Fort Frances||CA|48.6557|-93.4435|1125|176|1
YAK|PAYA|Yakutat||US|59.5087|-139.66|33|177|1
YAM|CYAM|Sault Ste Marie||CA|46.4832|-84.5085|630|96|1
YAY|CYAY|St. Anthony||CA|51.3919|-56.0832|108|163|1
YAZ|CYAZ|Tofino / Long Beach||CA|49.0798|-125.776|80|174|1
YBC|CYBC|Baie-Comeau||CA|49.1325|-68.2044|71|172|1
YBG|CYBG|Saguenay-Bagotville||CA|48.3301|-70.992|522|172|1
YBK|CYBK|Baker Lake||CA|64.2989|-96.0778|59|151|1
YBL|CYBL|Campbell River||CA|49.9508|-125.271|346|174|1
YBP|ZUYB|Yibin Wuliangye|Yibin (Cuiping)|CN|28.8584|104.526|1378|241|1
YBR|CYBR|Brandon||CA|49.91|-99.9519|1343|176|1
YBX|CYBX|Lourdes-de-Blanc-Sablon||CA|51.4436|-57.1853|121|77|1
YBY|CYBF|Bonnyville||CA|54.3042|-110.744|1836|98|1
YCB|CYCB|Cambridge Bay||CA|69.1081|-105.138|90|81|1
YCD|CYCD|Nanaimo||CA|49.055|-123.87|92|174|1
YCG|CYCG|Castlegar/West Kootenay||CA|49.2964|-117.632|1624|174|1
YCL|CYCL|Charlo||CA|47.9908|-66.3303|132|134|1
YCM|CYSN|Niagara District|Niagara-on-the-Lake|CA|43.1916|-79.1717|321|172|1
YDA|CYDA|Dawson City||CA|64.0431|-139.128|1215|93|1
YDF|CYDF|Deer Lake||CA|49.2082|-57.3961|72|163|1
YDN|CYDN|Dauphin Barker||CA|51.1008|-100.052|999|176|1
YEI|LTBR|Bursa Yenişehir||TR|40.2552|29.5626|764|294|1
YEV|CYEV|Inuvik Mike Zubko||CA|68.3042|-133.483|224|114|1
YFB|CYFB|Iqaluit||CA|63.7564|-68.5558|110|115|1
YFC|CYFC|Fredericton||CA|45.8687|-66.5299|68|134|1
YFS|CYFS|Fort Simpson||CA|61.7602|-121.237|555|114|1
YGJ|RJOH|Yonago Kitaro Airport / JASDF Miho||JP|35.4922|133.236|20|249|1
YGL|CYGL|La Grande Rivière||CA|53.6253|-77.7042|639|172|1
YGP|CYGP|Michel-Pouliot Gaspé||CA|48.7749|-64.4819|112|172|1
YGR|CYGR|Îles-de-la-Madeleine|Les Îles-de-la-Madeleine|CA|47.4252|-61.7786|35|110|1
YGV|CYGV|Havre-Saint-Pierre||CA|50.2819|-63.6114|124|172|1
YGW|CYGW|Kuujjuarapik||CA|55.2819|-77.7653|34|115|1
YHM|CYHM|John C. Munro Hamilton||CA|43.1735|-79.9312|780|172|1
YHU|CYHU|Montréal / Saint-Hubert||CA|45.5175|-73.4169|90|172|1
YHY|CYHY|Hay River / Merlyn Carter||CA|60.8397|-115.783|541|98|1
YIC|ZSYC|Yichun Mingyueshan||CN|27.8025|114.306|430|0|1
YIE|ZBES|Arxan Yi'ershi||CN|47.3106|119.912|2925|241|1
YIF|CYIF|St Augustin|St-Augustin|CA|51.2117|-58.6583|20|77|1
YIH|ZHYC|Yichang Sanxia|Yichang (Xiaoting)|CN|30.5541|111.483|673|241|1
YIN|ZWYN|Ili Yining|Ili (Yining / Ghulja)|CN|43.9558|81.3303|0|241|1
YIV|CYIV|Island Lake||CA|53.8572|-94.6536|770|176|1
YJT|CYJT|Stephenville Dymond||CA|48.5434|-58.5529|84|163|1
YKA|CYKA|Kamloops John Moose Fulton Field||CA|50.703|-120.449|1133|174|1
YKF|CYKF|Region of Waterloo|Breslau|CA|43.4608|-80.3786|1054|172|1
YKH|ZYYK|Yingkou Lanqi|Yingkou (Laobian)|CN|40.5425|122.359|0|241|1
YKL|CYKL|Schefferville||CA|54.8053|-66.8053|1709|172|1
YKM|KYKM|Yakima Air Terminal McAllister Field||US|46.5682|-120.544|1099|122|1
YKO|LTCW|Hakkari Yüksekova||TR|37.5497|44.2381|6400|294|1
YLK|CYLS|Barrie-Lake Simcoe||CA|44.4851|-79.5547|972|172|1
YLL|CYLL|Lloydminster||CA|53.3092|-110.073|2193|98|1
YLX|ZGYL|Yulin Fumian||CN|22.433|110.12|328|241|1
YMM|CYMM|Fort McMurray||CA|56.6533|-111.222|1211|98|1
YMO|CYMO|Moosonee||CA|51.2911|-80.6078|30|172|1
YMS|SPMS|Moises Benzaquen Rengifo|Yurimaguas|PE|-5.8938|-76.1182|587|121|1
YMT|CYMT|Chapais|Chibougamau|CA|49.7719|-74.5281|1270|172|1
YMX|CYMX|Montreal Mirabel|Montréal|CA|45.6795|-74.0387|270|172|1
YNA|CYNA|Natashquan||CA|50.1901|-61.789|39|77|1
YND|CYND|Ottawa / Gatineau||CA|45.5217|-75.5636|211|172|1
YNJ|ZYYJ|Yanji Chaoyangchuan||CN|42.8828|129.451|624|241|1
YNL|CYNL|Points North Landing||CA|58.2767|-104.082|1605|153|1
YOJ|CYOJ|High Level||CA|58.6214|-117.165|1110|98|1
YOL|DNYO|Yola||NG|9.2576|12.4304|599|30|1
YPA|CYPA|Prince Albert Glass Field||CA|53.2142|-105.673|1405|153|1
YPE|CYPE|Peace River||CA|56.2269|-117.447|1873|98|1
YPL|CYPL|Pickle Lake||CA|51.4464|-90.2142|1267|71|1
YPN|CYPN|Port-Menier||CA|49.8364|-64.2886|167|172|1
YPQ|CYPQ|Peterborough||CA|44.2323|-78.3621|628|172|1
YPR|CYPR|Prince Rupert||CA|54.2861|-130.445|116|174|1
YPW|CYPW|Powell River||CA|49.8342|-124.5|425|174|1
YPX|CYPX|Puvirnituq||CA|60.0506|-77.2869|74|115|1
YPY|CYPY|Fort Chipewyan||CA|58.7672|-111.117|761|98|1
YPZ|CYPZ|Burns Lake||CA|54.3764|-125.951|2343|174|1
YQA|CYQA|Muskoka|Gravenhurst|CA|44.9754|-79.3065|925|172|1
YQD|CYQD|The Pas||CA|53.9714|-101.091|887|176|1
YQG|CYQG|Windsor||CA|42.2756|-82.9556|622|172|1
YQH|CYQH|Watson Lake||CA|60.1168|-128.822|2255|175|1
YQK|CYQK|Kenora||CA|49.7883|-94.3631|1332|176|1
YQL|CYQL|Lethbridge||CA|49.6303|-112.8|3048|98|1
YQM|CYQM|Greater Moncton Roméo LeBlanc||CA|46.1132|-64.6772|232|134|1
YQN|CYQN|Nakina||CA|50.1828|-86.6964|1057|172|1
YQQ|CYQQ|Comox Valley International Airport / CFB Comox||CA|49.7108|-124.887|84|174|1
YQR|CYQR|Regina||CA|50.4319|-104.661|1894|153|1
YQT|CYQT|Thunder Bay||CA|48.3719|-89.3239|653|172|1
YQU|CYQU|Grande Prairie||CA|55.1797|-118.885|2195|98|1
YQX|CYQX|Gander||CA|48.9363|-54.5677|496|163|1
YQY|CYQY|Sydney / J.A. Douglas McCurdy||CA|46.1611|-60.0498|203|102|1
YQZ|CYQZ|Quesnel||CA|53.0261|-122.51|1789|174|1
YRB|CYRB|Resolute Bay||CA|74.7169|-94.9694|215|154|1
YRJ|CYRJ|Roberval||CA|48.5197|-72.2657|586|172|1
YRL|CYRL|Red Lake||CA|51.0669|-93.7931|1265|176|1
YRO|CYRO|Ottawa / Rockcliffe||CA|45.4605|-75.644|188|172|1
YRT|CYRT|Rankin Inlet||CA|62.8114|-92.1158|94|151|1
YSB|CYSB|Sudbury||CA|46.625|-80.7989|1141|172|1
YSF|CYSF|Stony Rapids||CA|59.2503|-105.841|805|153|1
YSJ|CYSJ|Saint John||CA|45.3161|-65.8903|357|134|1
YSL|CYSL|Saint-Léonard||CA|47.1571|-67.8362|793|134|1
YSM|CYSM|Fort Smith||CA|60.0203|-111.962|671|98|1
YSQ|ZYSQ|Songyuan Chaganhu|Qian Gorlos Mongol Autonomous County|CN|44.9311|124.552|459|241|1
YTH|CYTH|Thompson||CA|55.8011|-97.8642|729|176|1
YTS|CYTS|Timmins/Victor M. Power||CA|48.5697|-81.3767|967|172|1
YTY|ZSYA|Yangzhou Taizhou||CN|32.5634|119.72|7|241|1
YTZ|CYTZ|Billy Bishop Toronto City||CA|43.6279|-79.3955|252|172|1
YUM|KNYL|Yuma International Airport / Marine Corps Air Station Yuma||US|32.6509|-114.609|213|145|1
YUS|ZLYS|Yushu Batang|Yushu (Batang)|CN|32.8364|97.0364|12816|241|1
YUX|CYUX|Hall Beach|Sanirajak|CA|68.7761|-81.2425|30|115|1
YUY|CYUY|Rouyn Noranda|Rouyn-Noranda|CA|48.2061|-78.8356|988|172|1
YVB|CYVB|Bonaventure||CA|48.0711|-65.4603|123|172|1
YVC|CYVC|La Ronge||CA|55.1514|-105.262|1242|153|1
YVO|CYVO|Val-d'Or||CA|48.0533|-77.7828|1107|172|1
YVP|CYVP|Kuujjuaq||CA|58.0961|-68.4269|129|172|1
YVQ|CYVQ|Norman Wells||CA|65.2816|-126.798|238|114|1
YVV|CYVV|Wiarton||CA|44.7458|-81.1072|729|172|1
YWK|CYWK|Wabush||CA|52.9219|-66.8644|1808|103|1
YWL|CYWL|Williams Lake||CA|52.1831|-122.054|3085|174|1
YXC|CYXC|Cranbrook/Canadian Rockies||CA|49.6108|-115.782|3082|98|1
YXH|CYXH|Medicine Hat||CA|50.0189|-110.721|2352|98|1
YXJ|CYXJ|Fort St John / North Peace|Fort Saint John|CA|56.2381|-120.74|2280|94|1
YXK|CYXK|Rimouski||CA|48.4776|-68.4963|82|172|1
YXL|CYXL|Sioux Lookout||CA|50.1139|-91.9053|1258|176|1
YXS|CYXS|Prince George (International)||CA|53.8843|-122.667|2267|174|1
YXT|CYXT|Northwest Regional Airport Terrace-Kitimat||CA|54.4685|-128.576|713|174|1
YXU|CYXU|London||CA|43.0328|-81.149|912|172|1
YXX|CYXX|Abbotsford||CA|49.0253|-122.361|195|122|1
YXY|CYXY|Whitehorse / Erik Nielsen||CA|60.7085|-135.066|2317|175|1
YYA|ZGYY|Yueyang Sanhe|Yueyang (Yueyanglou)|CN|29.3117|113.282|230|241|1
YYB|CYYB|North Bay Jack Garland||CA|46.3636|-79.4228|1215|172|1
YYD|CYYD|Smithers||CA|54.8247|-127.183|1712|174|1
YYE|CYYE|Fort Nelson||CA|58.8364|-122.597|1253|100|1
YYF|CYYF|Penticton||CA|49.4631|-119.602|1129|174|1
YYG|CYYG|Charlottetown||CA|46.2889|-63.1252|160|110|1
YYL|CYYL|Lynn Lake||CA|56.8639|-101.076|1170|176|1
YYQ|CYYQ|Churchill||CA|58.7392|-94.065|94|176|1
YYR|CYYR|Goose Bay||CA|53.3192|-60.4258|160|103|1
YYY|CYYY|Mont Joli|Mont-Joli|CA|48.6086|-68.2081|172|172|1
YZF|CYZF|Yellowknife||CA|62.4628|-114.44|675|98|1
YZP|CYZP|Sandspit||CA|53.2543|-131.814|21|174|1
YZS|CYZS|Coral Harbour||CA|64.1933|-83.3594|210|71|1
YZT|CYZT|Port Hardy||CA|50.6806|-127.367|71|174|1
YZU|CYZU|Whitecourt||CA|54.1439|-115.787|2567|98|1
YZV|CYZV|Sept-Îles||CA|50.2233|-66.2656|180|172|1
YZY|ZLZY|Zhangye Ganzhou|Zhangye (Ganzhou)|CN|38.8019|100.675|5280|174|1
ZAL|SCVD|Pichoy|Valdivia|CL|-39.65|-73.0861|59|157|1
ZAT|ZPZT|Zhaotong Zhaoyang||CN|27.2058|103.692|0|241|1
ZBF|CZBF|Bathurst|South Tetagouche|CA|47.6297|-65.7389|193|134|1
ZBR|OIZC|Chabahar Konarak||IR|25.4432|60.3822|13|247|1
ZCL|MMZC|General Leobardo C. Ruiz|Zacatecas|MX|22.8949|-102.687|7141|132|1
ZEL|CBBC|Bella Bella (Campbell Island)||CA|52.185|-128.157|141|174|1
ZHY|ZLZW|Zhongwei Shapotou|Zhongwei (Shapotou)|CN|37.5731|105.154|4088|241|1
ZIG|GOGG|Ziguinchor||SN|12.5556|-16.2833|75|16|1
ZIX|UEVV|Zhigansk||RU|66.7965|123.361|292|255|1
ZKP|UESU|Zyryanka||RU|65.7485|150.889|140|243|1
ZLO|MMZO|Playa de Oro|Manzanillo|MX|19.1448|-104.559|30|132|1
ZMT|CZMT|Masset||CA|54.0275|-132.125|25|174|1
ZND|DRZR|Zinder||NE|13.779|8.9838|1516|44|1
ZNE|YNWN|Newman||AU|-23.4178|119.803|1724|276|1
ZOS|SCJO|Cañal Bajo Carlos Hott Siebert|Osorno|CL|-40.6112|-73.061|187|157|1
ZQZ|ZBZJ|Zhangjiakou Ningyuan||CN|40.7387|114.933|2347|0|1
ZSJ|CZSJ|Sandy Lake||CA|53.0642|-93.3444|951|176|1
ZTH|LGZA|Zakynthos International Airport Dionysios Solomos||GR|37.7509|20.8843|12|280|1
ZYI|ZUZY|Zunyi Xinzhou||CN|27.8107|107.247|2723|241|1
AAK|NGUK|Aranuka|Buariki|KI|0.1853|173.637|6|369|2
AAZ|MGQZ|Quezaltenango||GT|14.8656|-91.502|7779|107|2
ABM|YNPE|Northern Peninsula|Bamaga|AU|-10.9462|142.455|34|269|2
ABU|WATA|AA Bere Tallo (Haliwen)|Atambua|ID|-9.0748|124.903|1027|223|2
ACF|ZWAL|Aral Tarim||CN|40.4347|81.2621|0|241|2
AET|PFAL|Allakaket||US|66.5518|-152.622|441|53|2
AGE|EDWG|Wangerooge||DE|53.7825|7.9196|7|282|2
AGI|SMWA|Wageningen Airstrip||SR|5.8413|-56.6732|6|144|2
AGJ|RORA|Aguni||JP|26.5928|127.24|38|249|2
AIP|VIAX|Adampur||IN|31.4338|75.7588|775|216|2
AIT|NCAI|Aitutaki||CK|-18.8309|-159.764|14|366|2
AIU|NCAT|Enua|Atiu Island|CK|-19.9678|-158.119|36|366|2
AKA|ZLAK|Ankang Fuqiang|Ankang (Hanbin)|CN|32.757|108.873|1209|241|2
AKB|PAAK|Atka||US|52.2203|-174.206|57|52|2
AKI|PFAK|Akiak||US|60.9026|-161.231|30|53|2
AKK|PAKH|Akhiok||US|56.9387|-154.183|44|53|2
AKS|AGGA|Gwaunaru'u|Auki|SB|-8.7026|160.682|5|350|2
AKV|CYKO|Akulivik||CA|60.8186|-78.1486|75|115|2
ANS|SPHY|Andahuaylas||PE|-13.7064|-73.3504|11300|121|2
APK|NTGD|Apataki||PF|-15.5736|-146.415|8|368|2
ARD|WATM|Alor Island - Mali|Kabola|ID|-8.1323|124.597|10|223|2
ATT||Atmautluak||US|60.8667|-162.273|17|0|2
AUK|PAUK|Alakanuk||US|62.6827|-164.722|10|140|2
AUL||Aur Island|Aur Atoll|MH|8.1453|171.173|0|0|2
AUU|YAUR|Aurukun||AU|-13.354|141.72|31|269|2
BAS|AGGE|Ballalae||SB|-6.9907|155.887|5|350|2
BAZ|SWBC|Barcelos||BR|-0.9812|-62.9186|112|126|2
BBG|NGTU|Butaritari||KI|3.0858|172.811|5|369|2
BBR|TFFB|Basse-Terre Baillif||GP|16.0136|-61.7429|59|106|2
BDD|YBAU|Badu Island||AU|-10.1495|142.174|14|269|2
BDP|VNCG|Bhadrapur||NP|26.5708|88.0796|300|214|2
BFQ|MPPI|Bahia Piña|Puerto Piña|PA|7.5874|-78.1799|14|0|2
BGG|LTCU|Bingöl||TR|38.8601|40.5945|3506|294|2
BGK|MZBG|Big Creek||BZ|16.5194|-88.4079|22|0|2
BHR|VNBP|Bharatpur||NP|27.6781|84.4294|600|214|2
BID|KBID|Block Island State||US|41.1684|-71.5786|108|139|2
BKC|PABL|Buckland||US|65.9816|-161.149|31|53|2
BKM|WBGQ|Bakalalan||MY|3.974|115.618|2900|219|2
BKZ|HTBU|Bukoba||TZ|-1.332|31.8212|3784|17|2
BLB|MPPA|Panamá Pacífico|Panamá City|PA|8.9148|-79.5996|52|143|2
BLW|HCMN|Beledweyne||SO|4.767|45.2388|559|40|2
BMK|EDWR|Borkum||DE|53.5964|6.7092|3|282|2
BMO|VYBM|Banmaw||MM|24.2704|97.2476|370|256|2
BMR|EDWZ|Baltrum||DE|53.7249|7.3733|7|282|2
BMY|NWWC|Île Art - Waala||NC|-19.7205|163.661|306|361|2
BNB|FZGN|Boende||CD|-0.2867|20.8836|1168|29|2
BNY|AGGB|Bellona/Anua||SB|-11.3022|159.798|60|350|2
BOT|AYET|Bosset||PG|-7.2373|141.106|80|0|2
BQB|YBLN|Busselton Margaret River||AU|-33.6872|115.4|55|276|2
BQG|UHNB|Bogorodskoye||RU|52.381|140.449|150|254|2
BQJ|UEBB|Batagay||RU|67.648|134.695|696|254|2
BRA|SNBR|Dom Ricardo Weberberger|Barreiras|BR|-12.0789|-45.009|2451|72|2
BSX|VYPN|Pathein||MM|16.8152|94.7799|20|256|2
BTT|PABT|Bettles||US|66.9139|-151.529|647|53|2
BTW|WAOC|Bersujud|Batu Licin|ID|-3.4124|115.995|3|223|2
BUC|YBKT|Burketown||AU|-17.7486|139.534|21|269|2
BUI|WAVB|Bokondini||ID|-3.6846|138.677|4550|209|2
BUT|VQBT|Bathpalathang|Jakar|BT|27.5622|90.7471|8485|248|2
BUU|WIJB|Muara Bungo||ID|-1.5416|102.182|192|0|2
BVS|SNVS|Breves||BR|-1.6365|-50.4436|98|75|2
BWX|WADY|Banyuwangi|Rogojampi, Banyuwangi|ID|-8.3102|114.34|112|0|2
BXG|YBDG|Bendigo||AU|-36.7394|144.33|705|275|2
BXT|WALC|LNG Badak|Bontang-Borneo Island|ID|0.1217|117.477|49|223|2
BYO|SBDB|Bonito||BR|-21.2473|-56.4524|1180|82|2
BYR|EKLS|Læsø||DK|57.2772|11.0001|25|288|2
BYW|38WA|Blakely Island||US|48.5792|-122.824|66|122|2
CAF|SWCA|Carauari||BR|-4.8715|-66.8976|355|126|2
CAU|SNRU|Caruaru||BR|-8.2824|-36.0135|1891|152|2
CCA|SLHI|Chimore||BO|-16.9768|-65.1456|875|0|2
CCV|NVSF|Craig Cove||VU|-16.265|167.924|69|345|2
CEL|SSCN|Canela||BR|-29.3701|-50.8317|2746|159|2
CEM|PACE|Central||US|65.5738|-144.781|937|53|2
CFB|SBCB|Cabo Frio||BR|-22.9215|-42.0719|22|159|2
CHU|PACH|Chuathbaluk||US|61.5791|-159.216|244|53|2
CHY|AGGC|Choiseul Bay||SB|-6.7119|156.396|0|350|2
CIH|ZBCZ|Changzhi Wangcun||CN|36.2475|113.126|0|241|2
CIK|PACI|Chalkyitsik||US|66.645|-143.74|544|53|2
CJN|WICN|Nusawiru|Cijulang|ID|-7.7199|108.489|16|0|2
CJZ|SJZA|Pedro Vieira Moreira|Cajazeiras|BR|-6.8827|-38.6158|1099|159|2
CKD|PACJ|Crooked Creek||US|61.8703|-158.138|178|0|2
CKW|YCHK|Christmas Creek|Christmas Creek Mine|AU|-22.3543|119.643|1462|276|2
CKX||Chicken||US|64.0665|-141.951|1640|0|2
CLP|PFCL|Clarks Point||US|58.8337|-158.529|80|53|2
CLV|SBCN|Nelson Ribeiro Guimarães|Caldas Novas|BR|-17.7251|-48.6063|2307|159|2
CNC|YCCT|Coconut Island||AU|-10.0501|143.07|3|269|2
CNI|ZYCH|Changhai Dachangshandao|Dalian (Changhai)|CN|39.2664|122.667|80|241|2
COL|EGEL|Coll|Coll Island|GB|56.6019|-6.6178|21|301|2
CRU|TGPZ|Lauriston|Carriacou Island|GD|12.4761|-61.4728|5|105|2
CSA|EGEY|Colonsay Airstrip||GB|56.0575|-6.2431|44|301|2
CSH|ULAS|Solovki|Solovetsky Islands|RU|65.03|35.7306|60|307|2
CUA|MMDA|Ciudad Constitución|Comondú|MX|25.0538|-111.615|213|129|2
CVU|LPCR|Corvo||PT|39.6715|-31.1136|62|259|2
CWS|78WA|Center Island||US|48.49|-122.832|115|122|2
CYF|PACK|Chefornak||US|60.1367|-164.279|49|140|2
CYT|PACY|Yakataga||US|60.081|-142.494|12|53|2
CYU|RPLO|Cuyo||PH|10.8581|121.069|0|224|2
DAX|ZUDX|Dachuan|Dazhou (Daxian)|CN|31.1302|107.43|0|241|2
DBA|OPDB|Dalbandin||PK|28.8783|64.3998|2800|213|2
DBM|HADM|Debre Markos||ET|10.3215|37.7419|8136|3|2
DEE|UHSM|Yuzhno-Kurilsk Mendeleyevo||RU|43.9611|145.685|584|222|2
DEM|HADD|Dembidollo||ET|8.554|34.858|5200|3|2
DEX|WAVD|Nop Goliat Dekai||ID|-4.8557|139.482|198|0|2
DGH|VEDO|Deoghar||IN|24.4468|86.705|361|216|2
DIU|VADU|Diu||IN|20.7142|70.9219|31|216|2
DJB|WIJJ|Sultan Thaha|Jambi|ID|-1.6387|103.645|82|208|2
DLR|UHHD|Dalnerechensk||RU|45.8799|133.738|272|0|2
DMD|YDMG|Doomadgee||AU|-17.9403|138.822|153|269|2
DOP|VNDP|Dolpa||NP|28.9857|82.8187|8200|214|2
DPT|UEBD|Deputatskiy||RU|69.3925|139.89|950|0|2
DQA|ZYDQ|Daqing Sartu||CN|46.7509|125.139|496|241|2
DRJ|SMDA|Drietabbetje||SR|4.1114|-54.6728|236|144|2
DRV|VRMD|Dharavandhoo|Baa Atoll|MV|5.1561|73.1302|6|0|2
DSD|TFFA|La Désirade|Grande Anse|GP|16.2969|-61.0844|10|106|2
DSE|HADC|Kombolcha|Dessie|ET|11.1098|39.7259|6120|3|2
DTB|WIMN|Silangit|Siborong-Borong|ID|2.2597|98.9919|4700|208|2
DTD|WALJ|Datadawai|Datadawai-Borneo Island|ID|0.807|114.529|508|223|2
DTR|WN07|Decatur Shores||US|48.5002|-122.814|38|122|2
DWB|FMNO|Soalala||MG|-16.1017|45.3588|141|330|2
DXJ|ZGXX|Xiangxi Biancheng||CN|28.4972|109.522|0|0|2
EAA|PAEG|Eagle||US|64.778|-141.15|908|53|2
EAX|SMEG|Eduard Alexander Gummels|Kwatta|SR|5.8638|-55.1895|49|0|2
EBH|DAOY|El Bayadh||DZ|33.7217|1.0925|4493|4|2
EDR|YPMP|Pormpuraaw||AU|-14.8965|141.609|10|269|2
EEK|PAEE|Eek||US|60.2132|-162.044|12|140|2
EJT||Enejit|Enejit Island|MH|6.0404|171.985|30|0|2
EKS|UHSK|Shakhtyorsk||RU|49.1903|142.083|50|238|2
ELI|PFEL|Elim||US|64.6147|-162.272|162|140|2
EME|EDWE|Emden||DE|53.3911|7.2275|3|282|2
ENE|WATE|H. Hasan Aroeboesman (Ende)||ID|-8.8491|121.661|49|223|2
ENI|RPEN|El Nido||PH|11.2024|119.416|0|224|2
ENT|PKMA|Eniwetok|Eniwetok Atoll|MH|11.3407|162.328|13|356|2
EUA|NFTE|Kaufana|Eua Island|TO|-21.3783|-174.958|325|370|2
EVG|ESND|Sveg||SE|62.0478|14.4229|1178|320|2
FBD|OAFZ|Fayzabad||AF|37.1221|70.5201|3872|211|2
FBE|SSFB|Paulo Abdala|Francisco Beltrão|BR|-26.0594|-53.0638|2113|159|2
FDE|ENBL|Førde Airport, Bringeland||NO|61.3911|5.7569|1046|308|2
FHZ|NTKH|Fakahina||PF|-15.9923|-140.164|3|368|2
FIE|EGEF|Fair Isle||GB|59.5347|-1.6285|223|301|2
FLS|YFLI|Flinders Island|Whitemark|AU|-40.0917|147.993|10|272|2
FMT|VRQF|Faresmaathoda|Faresmaathodaa|MV|0.1926|73.1968|0|0|2
FND|VRCF|Funadhoo||MV|6.1624|73.2875|0|335|2
FOA|EG3G|Foula||GB|60.1219|-2.0534|150|0|2
FRE|AGGF|Fera/Maringe|Fera Island|SB|-8.1075|159.577|9|350|2
FSH|WIMI|Syekh Hamzah Fansyuri|Singkil|ID|2.2696|97.9679|17|0|2
FTA|NVVF|Futuna|Futuna Island|VU|-19.5164|170.232|95|345|2
FTI|NSFQ|Fitiuta|Fitiuta Village|AS|-14.2161|-169.424|110|362|2
FUT|NLWF|Pointe Vele|Futuna Island|WF|-14.3116|-178.066|20|372|2
GAX|FOGX|Gamba||GA|-2.7853|10.0472|30|0|2
GBI|VOGB|Kalaburagi||IN|17.3082|76.9652|1571|216|2
GBZ|NZGB|Great Barrier|Claris|NZ|-36.2414|175.472|20|340|2
GGF|SNYA|Almeirim||BR|-1.4795|-52.5782|584|156|2
GGJ|SSGY|Guaíra||BR|-24.0811|-54.1917|889|82|2
GGR|HCGR|Garowe||SO|8.4585|48.5681|1465|0|2
GGS|SAWR|Gobernador Gregores||AR|-48.7831|-70.15|356|63|2
GIC|YBOI|Boigu Island||AU|-9.2328|142.218|23|269|2
GKK|VRMO|Kooddoo|Huvadhu Atoll|MV|0.7324|73.4336|29|335|2
GLK|HCMR|Galcaio||SO|6.7808|47.4547|975|40|2
GLV|PAGL|Golovin||US|64.5505|-163.007|59|140|2
GMI|AYGT|Gasmata Island||PG|-6.2711|150.331|23|365|2
GMZ|GCGM|La Gomera|Alajero, La Gomera Island|ES|28.0296|-17.2146|716|261|2
GNU||Goodnews||US|59.1176|-161.575|15|0|2
GOY|UNIT|Tura Mountain||RU|64.3335|100.433|2044|217|2
GTA|AGOK|Gatokae||SB|-8.7384|158.203|70|350|2
GTO|WAMG|Jalaluddin|Gorontalo|ID|0.6371|122.85|105|223|2
GUB|MMGR|Guerrero Negro|San Quintín|MX|28.0261|-114.024|59|129|2
GUZ|SNGA|Guarapari||BR|-20.6465|-40.4919|30|159|2
GYZ|YGRM|Gruyere|Cosmo Newbery|AU|-28.0345|123.815|1542|276|2
GZG|ZUGZ|Garze Gesar|Garzê (Garzê)|CN|31.7575|99.5542|13346|241|2
GZO|AGGN|Nusatupe|Gizo|SB|-8.0978|156.864|13|350|2
HAA|ENHK|Hasvik||NO|70.4867|22.1397|21|308|2
HAL|FYHI|Halali||NA|-19.0285|16.4585|3639|0|2
HBQ|ZLHB|Haibei Qilian|Haibei (Qilian)|CN|38.0081|100.645|10377|241|2
HDD|OPKD|Hyderabad||PK|25.3181|68.3661|130|213|2
HDK|VRBK|Kulhudhuffushi||MV|6.6308|73.0678|0|335|2
HDO|VIDX|Hindon Airport / Hindon Air Force Station|Ghaziabad|IN|28.7077|77.3589|700|216|2
HEI|EDXB|Heide-Büsum|Oesterdeichstrich|DE|54.1533|8.9017|7|282|2
HFS|ESOH|Hagfors|Råda|SE|60.0201|13.5789|474|320|2
HGD|YHUG|Hughenden||AU|-20.815|144.225|1043|269|2
HGL|EDXH|Helgoland-Düne||DE|54.1853|7.9158|8|282|2
HHZ|NTGH|Hikueru||PF|-17.5483|-142.612|12|368|2
HIL|HASL|Shilavo||ET|6.0775|44.7637|1296|0|2
HJB|ZWHJ|Hejing Bayinbuluke||CN|42.9764|83.9955|8219|0|2
HLH|ZBUL|Ulanhot Yilelite||CN|46.1953|122.008|0|241|2
HMS|WAGB|Haji Muhammad Sidik|Muara Teweh|ID|-1.0258|114.929|145|0|2
HMV|ESUT|Hemavan||SE|65.8061|15.0828|1503|320|2
HNH|PAOH|Hoonah||US|58.0961|-135.41|19|117|2
HNY|ZGHY|Hengyang Nanyue||CN|26.7221|112.618|0|241|2
HOK|YHOO|Hooker Creek|Lajamanu|AU|-18.3367|130.638|320|271|2
HPB|PAHP|Hooper Bay||US|61.5239|-166.147|13|140|2
HQQ|ZHQQ|Anyang Hongqiqu||CN|35.8708|114.462|0|0|2
HRF|VRAH|Hoarafushi||MV|6.9697|72.8963|0|335|2
HUE|HAHU|Humera|Akwi|ET|13.8301|36.8824|1930|3|2
HUG|MGHT|Huehuetenango||GT|15.3167|-91.5056|6135|107|2
HUS|PAHU|Hughes||US|66.0411|-154.263|299|53|2
IAO|RPNS|Siargao|Del Carmen|PH|9.8591|126.014|10|224|2
IBB|SEII|General Villamil|Puerto Villamil|EC|-0.9426|-90.953|35|348|2
ICC|SVIE|Andrés Miguel Salazar Marcano|Isla de Coche|VE|10.7944|-63.9816|10|84|2
ICI|NFCI|Cicia||FJ|-17.7433|-179.342|13|346|2
IGG|PAIG|Igiugig||US|59.324|-155.902|90|53|2
IIA|EIMN|Inishmaan|Inis Meáin|IE|53.093|-9.5681|15|289|2
IKO|PAKO|Nikolski Air Station||US|52.9416|-168.85|77|140|2
ILF|CZBD|Ilford||CA|56.0516|-95.6188|642|176|2
IMK|VNST|Simikot||NP|29.9711|81.8189|9246|214|2
INB|MZSV|Independence||BZ|16.5346|-88.4416|18|0|2
INO|FZBA|Inongo||CD|-1.9472|18.2858|1040|29|2
INQ|EIIR|Inisheer|Inis Oírr|IE|53.0647|-9.5109|40|289|2
IOR|EIIM|Inishmore|Inis Mór|IE|53.1067|-9.6536|24|289|2
IRA|AGGK|Ngorangora|Kirakira|SB|-10.4497|161.898|54|350|2
IRC|PACR|Circle City (New)||US|65.8277|-144.076|613|53|2
IRZ|SWTP|Tapuruquara|Santa Isabel do Rio Negro|BR|-0.3786|-64.9926|141|126|2
ISC|EGHE|St. Mary's|St. Mary's, Isles of Scilly|GB|49.9134|-6.2919|116|301|2
ITU|UHSI|Iturup|Kurilsk|RU|45.2564|147.956|387|0|2
IWD|KIWD|Gogebic Iron|Ironwood|US|46.5253|-90.1316|1230|130|2
JBB|WARE|Notohadinegoro|Jember|ID|-8.2425|113.694|281|0|2
JBK|ZWQT|Qitai Jiangbulake||CN|44.1661|89.5501|0|0|2
JCK|YJLC|Julia Creek||AU|-20.6683|141.723|404|269|2
JDO|SBJU|Orlando Bezerra de Menezes|Juazeiro do Norte|BR|-7.2193|-39.2691|1342|101|2
JEJ||Jeh|Ailinglapalap Atoll|MH|7.5654|168.962|10|0|2
JFR|BGPT|Paamiut||GL|62.0147|-49.6709|120|142|2
JGB|VEJR|Jagdalpur||IN|19.0743|82.0368|1822|0|2
JIK|LGIK|Ikaria|Ikaria Island|GR|37.6827|26.3471|79|280|2
JIO|WAPM|Jos Orno Imsula|Tiakur|ID|-8.1407|127.91|43|0|2
JIU|ZSJJ|Jiujiang Lushan||CN|29.4769|115.801|0|241|2
JJG|SBJA|Humberto Ghizzo Bortoluzzi|Jaguaruna|BR|-28.6753|-49.0596|120|159|2
JJM|HKMK|Mulika Lodge|Meru-Kinna|KE|0.1651|38.1951|2230|42|2
JKL|LGKY|Kalymnos|Kalymnos Island|GR|36.9633|26.9406|771|280|2
JLG|VAJL|Jalgaon||IN|20.9627|75.6275|818|0|2
JMO|VNJS|Jomsom||NP|28.7804|83.723|8976|214|2
JNX|LGNX|Naxos Island||GR|37.0811|25.3681|10|280|2
JPE|SNEB|Nagib Demachki|Paragominas|BR|-3.0198|-47.3165|443|75|2
JPR|SBJI|Ji-Paraná||BR|-10.8707|-61.8467|598|148|2
JQA|BGUQ|Qaarsut|Uummannaq|GL|70.7342|-52.6962|289|142|2
JRG|VEJH|Jharsuguda||IN|21.9135|84.0504|751|216|2
JSK|OIZJ|Jask|Bandar-e-Jask|IR|25.6548|57.8017|19|247|2
JSU|BGMQ|Maniitsoq||GL|65.4125|-52.9394|91|142|2
JSY|LGSO|Syros|Syros Island|GR|37.4228|24.9509|236|280|2
JTY|LGPL|Astypalaia|Astypalaia Island|GR|36.5799|26.3758|165|280|2
JUH|ZSJH|Chizhou Jiuhuashan||CN|30.7403|117.686|60|0|2
JUI|EDWJ|Juist||DE|53.6814|7.0564|7|282|2
JUM|VNJL|Jumla||NP|29.2742|82.1933|7700|214|2
JUV|BGUK|Upernavik||GL|72.7902|-56.1306|414|142|2
KAA|FLKS|Kasama||ZM|-10.2102|31.123|4541|35|2
KAL|PAKV|Kaltag||US|64.3186|-158.742|181|53|2
KAX|YKBR|Kalbarri||AU|-27.6928|114.259|157|276|2
KBC||Birch Creek||US|66.274|-145.824|450|0|2
KBU|WAOK|Gusti Syamsir Alam|Stagen|ID|-3.2948|116.164|4|223|2
KCA|ZWKC|Kuqa Qiuci||CN|41.6779|82.8729|3524|241|2
KCG|PAJC|Chignik||US|56.3115|-158.373|18|53|2
KCQ||Chignik Lake||US|56.255|-158.775|50|0|2
KDD|OPKH|Khuzdar||PK|27.7906|66.6473|4012|213|2
KDI|WAWW|Haluoleo|Kendari|ID|-4.0816|122.418|538|223|2
KDV|NFKD|Vunisea||FJ|-19.0581|178.157|6|346|2
KEB||Nanwalek||US|59.3521|-151.925|27|0|2
KEW|CPV8|Keewaywin||CA|52.9911|-92.8364|988|176|2
KFG|YKKG|Kalkgurung||AU|-17.4319|130.808|646|271|2
KFP|PAKF|False Pass||US|54.8475|-163.407|20|140|2
KGE|AGKG|Kaghau|Kagau Island|SB|-7.3305|157.585|30|350|2
KGK|PAJZ|Koliganek||US|59.7266|-157.259|269|53|2
KGX|PAGX|Grayling||US|62.8952|-160.066|99|0|2
KHM|VYKI|Kanti||MM|25.9883|95.6744|6000|256|2
KHZ|NTKA|Kauehi||PF|-15.7806|-145.128|13|368|2
KIE|AYIQ|Aropa|Kieta|PG|-6.3057|155.728|20|341|2
KIF|CNM5|Kingfisher Lake||CA|53.0125|-89.8553|866|176|2
KIO||Kili|Kili Island|MH|5.6439|169.125|5|0|2
KIT|LGKC|Kithira|Kithira Island|GR|36.274|23.0167|1045|280|2
KKA|PAKK|Koyuk Alfred Adams||US|64.9395|-161.154|154|53|2
KKH|PADY|Kongiganak||US|59.9608|-162.881|30|140|2
KKI|PFZK|Akiachak||US|60.9138|-161.493|23|0|2
KLG|PALG|Kalskag||US|61.5363|-160.341|55|53|2
KLN|PALB|Larsen Bay||US|57.5352|-153.976|87|53|2
KLP|WAGF|Seruyan Kuala Pembuang||ID|-3.3761|112.537|13|0|2
KMN|FZSB|Kamina City||CD|-8.7289|24.9914|3475|34|2
KMO|PAMB|Manokotak||US|58.9321|-158.902|107|53|2
KNK|PFKK|Kokhanok||US|59.4332|-154.802|115|53|2
KNW|PANW|New Stuyahok||US|59.4518|-157.374|364|53|2
KOC|NWWK|Koumac||NC|-20.5463|164.256|42|361|2
KOT|PFKO|Kotlik||US|63.0306|-163.533|15|140|2
KOW|ZSGZ|Ganzhou Huangjin||CN|25.8533|114.779|387|241|2
KOZ||Ouzinkie||US|57.9421|-152.464|55|0|2
KPN|PAKI|Kipnuk||US|59.9318|-164.028|11|140|2
KPV|PAPE|Perryville||US|55.9065|-159.161|29|53|2
KQA|PAUT|Akutan||US|54.1446|-165.604|133|140|2
KQR|YKAR|Karara||AU|-29.2172|116.687|1011|0|2
KRB|YKMB|Karumba||AU|-17.4567|140.83|5|269|2
KRC|WIJI|Departi Parbo|Sungai Penuh|ID|-2.094|101.47|2600|208|2
KRE|HBBO|Kirundo||BI|-2.5448|30.0946|4511|12|2
KRI|AYKK|Kikori||PG|-7.4244|144.25|50|365|2
KRY|ZWKM|Karamay||CN|45.4665|84.9527|0|241|2
KSJ|LGKS|Kasos|Kasos Island|GR|35.4214|26.91|35|280|2
KSM|PASM|St Mary's||US|62.0605|-163.302|312|140|2
KSO|LGKA|Kastoria National Airport Aristotle|Argos Orestiko|GR|40.4463|21.2822|2167|280|2
KSQ|UZSK|Karshi||UZ|38.8022|65.7731|1230|239|2
KSR|WAWH|Selayar - Haji Aroeppala|Benteng|ID|-6.1792|120.438|13|0|2
KTS|PFKT|Brevig Mission||US|65.3318|-166.468|38|140|2
KUD|WBKT|Kudat||MY|6.9241|116.837|10|219|2
KUG|YKUB|Kubin Island||AU|-10.2265|142.22|15|269|2
KUK|PFKA|Kasigluk||US|60.8727|-162.525|48|140|2
KVC|PAVC|King Cove||US|55.1163|-162.266|155|140|2
KVK|XLMK|Kirovsk-Apatity||RU|67.4629|33.5853|515|307|2
KVL|PAVL|Kivalina||US|67.7346|-164.56|13|140|2
KVM|UHMO|Markovo||RU|64.6654|170.418|75|182|2
KWB|WAHU|Dewadaru|Karimunjawa|ID|-5.8009|110.478|35|0|2
KWK|PAGG|Kwigillingok||US|59.8765|-163.169|18|140|2
KWN|PAQH|Quinhagak||US|59.7551|-161.845|42|53|2
KWT|PFKW|Kwethluk||US|60.7903|-161.444|25|53|2
KXF|NFNO|Koro Island||FJ|-17.3458|179.422|358|346|2
KXO|HUKI|Kisoro||UG|-1.2837|29.7197|6200|0|2
KYK|PAKY|Karluk||US|57.5659|-154.454|137|53|2
KYU|PFKU|Koyukuk||US|64.8761|-157.727|149|53|2
KZR|LTBZ|Zafer|Altıntaş|TR|39.1111|30.1304|3327|294|2
KZS|LGKJ|Kastelorizo|Kastelorizo Island|GR|36.1417|29.5764|489|280|2
LAK|CYKD|Aklavik/Freddie Carmichael||CA|68.2233|-135.006|23|114|2
LBJ|WATO|Komodo|Labuan Bajo, Manggarai Barat|ID|-8.4807|119.888|66|223|2
LBP||Long Banga||MY|3.2021|115.402|750|0|2
LBR|SWLB|Lábrea||BR|-7.279|-64.7695|243|126|2
LBW|WAQJ|Yuvai Semaring|Long Bawan|ID|3.9005|115.69|2540|223|2
LCR|SKHZ|Virgilio Barco Vargas (La Chorrera)||CO|-1.4564|-72.8011|564|0|2
LDG|ULAL|Leshukonskoye||RU|64.896|45.723|220|307|2
LDH|YLHI|Lord Howe Island||AU|-31.5382|159.076|5|274|2
LEC|SBLE|Coronel Horácio de Mattos|Lençóis|BR|-12.4823|-41.277|1676|72|2
LEL|YLEV|Lake Evella||AU|-12.4989|135.806|256|271|2
LEQ|EGHC|Land's End|Land's End, Cornwall|GB|50.1028|-5.6706|398|301|2
LEV|NFNB|Levuka|Bureta|FJ|-17.7111|178.759|11|346|2
LGL|WBGF|Long Lellang|Long Datih|MY|3.421|115.154|1400|219|2
LGZ|ZUSH|Shannan Longzi||CN|28.4224|92.3481|12959|0|2
LIK||Likiep|Likiep Island|MH|9.8232|169.308|0|0|2
LKA|WATL|Larantuka Gewayentana|Tiwatobi|ID|-8.2744|123.002|63|223|2
LKB|NFNK|Lakeba Island||FJ|-18.1992|-178.817|280|346|2
LKI|WIML|Lasikin|Lubang|ID|2.4113|96.3277|19|208|2
LKM|WAMI|Bolaang Mongondow|Lolak|ID|0.8885|124.034|28|223|2
LLB|ZULB|Libo|Qiannan (Libo)|CN|25.4525|107.962|0|241|2
LLK|UBBL|Lankaran||AZ|38.7579|48.807|30|189|2
LLO|WAFD|Bua - Palopo Lagaligo||ID|-3.0823|120.245|14|0|2
LMA|PAMH|Minchumina||US|63.886|-152.302|678|53|2
LMC|SKNA|La Macarena||CO|2.1757|-73.7867|790|0|2
LMY|AYLM|Lake Murray||PG|-7.0099|141.494|52|365|2
LNB|NVSM|Lamen Bay||VU|-16.5842|168.159|7|345|2
LNE|NVSO|Lonorore||VU|-15.8656|168.172|43|345|2
LNU|WAQM|Robert Atty Bessing|Malinau|ID|3.5753|116.62|26|0|2
LNV|AYKY|Londolovit||PG|-3.0436|152.629|167|365|2
LOD|NVSG|Longana||VU|-15.3067|167.967|167|345|2
LOH|SECA|Ciudad de Catamayo|La Toma (Catamayo)|EC|-3.9956|-79.3719|4056|108|2
LPD|SKLP|La Pedrera||CO|-1.3249|-69.5813|590|79|2
LPM|NVSL|Lamap||VU|-16.4611|167.829|7|345|2
LPS||Lopez Island||US|48.4839|-122.938|209|0|2
LPU|WAQL|Long Apung|Long Apung-Borneo Island|ID|1.7069|114.97|2437|223|2
LPY|LFHP|Le Puy-Loudes|Chaspuzac, Haute-Loire|FR|45.0807|3.7629|2731|309|2
LQM|SKLG|Caucaya|Puerto Leguízamo|CO|-0.1823|-74.7708|573|79|2
LRS|LGLE|Leros|Leros Island|GR|37.1849|26.8003|39|280|2
LRV|SVRS|Los Roques|Gran Roque Island|VE|11.9469|-66.6683|17|84|2
LSA|AYKA|Losuia||PG|-8.5058|151.081|27|365|2
LSW|WIMA|Malikus Saleh|Lhok Seumawe-Sumatra Island|ID|5.2267|96.9503|90|208|2
LTT|LFTZ|La Môle|Saint-Tropez|FR|43.2054|6.482|59|309|2
LUP|PHLU|Kalaupapa||US|21.211|-156.974|24|352|2
LVO|YLTN|Laverton||AU|-28.6143|122.429|1530|276|2
LWK|EGET|Lerwick / Tingwall|Lerwick, Shetland Islands|GB|60.1922|-1.2436|43|301|2
LWY|WBGW|Lawas||MY|4.8492|115.408|5|219|2
LXG|VLLN|Luang Namtha||LA|20.967|101.4|1968|253|2
LXS|LGLM|Limnos|Limnos Island|GR|39.9171|25.2363|14|280|2
MBL|KMBL|Manistee County Blacker||US|44.2727|-86.2465|621|96|2
MCV|YMHU|McArthur River Mine||AU|-16.4425|136.084|131|271|2
MFA|HTMA|Mafia|Kilindoni|TZ|-7.9175|39.6685|60|17|2
MFG|OPMF|Muzaffarabad||PK|34.3388|73.5089|2691|213|2
MFJ|NFMO|Moala||FJ|-18.5667|179.951|13|346|2
MGT|YMGB|Milingimbi|Milingimbi Island|AU|-12.0944|134.894|53|271|2
MHC|SCPQ|Mocopulli|Dalcahue|CL|-42.3404|-73.7157|528|157|2
MHM|AGOB|Manaoba||SB|-8.325|160.8|14|0|2
MHX|NCMH|Manihiki Island||CK|-10.3809|-160.999|11|366|2
MIJ||Mili Island||MH|6.0848|171.731|4|356|2
MIS|AYMS|Misima Island||PG|-10.6892|152.838|26|365|2
MJE||Majkin||MH|8.1634|168.174|24|0|2
MJY|UNIM|Motygino||RU|58.1809|94.7453|538|0|2
MLL|PADM|Marshall Don Hunter Sr||US|61.8643|-162.026|103|53|2
MLO|LGML|Milos|Milos Island|GR|36.6969|24.4769|10|280|2
MLY|PAML|Manley Hot Springs||US|64.9919|-150.644|270|53|2
MNF|NFMA|Mana Island||FJ|-17.6728|177.099|0|346|2
MNT||Minto Al Wright||US|65.148|-149.369|460|0|2
MNU|VYMM|Mawlamyine||MM|16.4447|97.6607|52|256|2
MNY|AGGO|Mono|Stirling Island|SB|-7.4169|155.565|35|350|2
MOF|WATC|Frans Xavier Seda|Waioti|ID|-8.6395|122.238|115|223|2
MOH|WAFO|Maleo|Morowali|ID|-2.2011|121.663|12|0|2
MOI|NCMR|Mitiaro Island||CK|-19.8425|-157.703|25|366|2
MOJ|SMMO|Moengo Airstrip||SR|5.6076|-54.4003|49|144|2
MOU|PAMO|Mountain Village||US|62.0954|-163.682|337|140|2
MPC|WIPU|Muko Muko||ID|-2.5411|101.088|24|208|2
MQC|LFVM|Miquelon||PM|47.0955|-56.3803|10|133|2
MRA|HLMS|Misrata||LY|32.325|15.061|60|0|2
MSA|CZMD|Muskrat Dam||CA|53.4414|-91.7628|911|176|2
MTF|HAMT|Mizan Teferi||ET|6.9571|35.5547|4396|3|2
MTP|KMTP|Montauk||US|41.0765|-71.9208|6|139|2
MUK|NCMK|Mauke|Mauke Island|CK|-20.1361|-157.345|26|366|2
MUZ|HTMU|Musoma||TZ|-1.503|33.8021|3806|17|2
MVY|KMVY|Martha's Vineyard||US|41.3931|-70.6143|67|139|2
MWQ|VYMW|Magway||MM|20.1656|94.9414|279|256|2
MXH|AYMR|Moro||PG|-6.3633|143.238|2740|365|2
MXW|ZMMG|Mandalgobi||MN|45.7381|106.269|4550|0|2
MXZ|ZGMX|Meizhou Meixian Changgangji|Meizhou (Meixian)|CN|24.2634|116.098|312|241|2
MYI|YMAE|Murray Island||AU|-9.9151|144.055|300|269|2
MYK|KMYK|May Creek||US|61.3357|-142.687|1650|0|2
MZH|LTAP|Amasya Merzifon||TR|40.8294|35.522|1758|294|2
NAO|ZUNC|Nanchong Gaoping|Nanchong (Gaoping)|CN|30.7981|106.164|1145|241|2
NAU|NTGN|Napuka Island||PF|-14.1774|-141.266|7|368|2
NBN|FGAN|Annobón|San Antonio de Palé|GQ|-1.4086|5.6242|82|0|2
NCN|PFCB|Chenega Bay||US|60.0776|-147.995|72|53|2
NDY|EGES|Sanday||GB|59.2503|-2.5767|68|301|2
NGI|NFNG|Ngau||FJ|-18.1156|179.34|50|346|2
NGK|UHSN|Nogliki||RU|51.784|143.142|109|0|2
NIB|PAFS|Nikolai||US|63.0179|-154.36|441|53|2
NIU|NTKN|Naiu|Naiu Atoll|PF|-16.1193|-146.369|50|0|2
NLF|YDNI|Darnley Island||AU|-9.5792|143.78|0|269|2
NLG|PAOU|Nelson Lagoon||US|56.0075|-161.16|14|53|2
NME|PAGT|Nightmute||US|60.4691|-164.704|4|140|2
NNB|AGGT|Santa Ana|Santa Ana Island|SB|-10.848|162.454|3|350|2
NNR|EICA|Connemara|Inverin|IE|53.2303|-9.4678|70|289|2
NNY|ZHNY|Nanyang Jiangying|Nanyang (Wancheng)|CN|32.9827|112.618|840|241|2
NOD|EDWS|Norden-Norddeich||DE|53.6331|7.1903|3|282|2
NQU|SKNQ|Reyes Murillo|Nuquí|CO|5.7103|-77.2619|12|79|2
NRD|EDWY|Norderney||DE|53.7069|7.23|7|282|2
NRL|EGEN|North Ronaldsay||GB|59.3675|-2.4344|40|301|2
NTT|NFTP|Kuini Lavenia|Niuatoputapu|TO|-15.9773|-173.791|30|370|2
NUL|PANU|Nulato||US|64.7293|-158.074|399|53|2
NUP|PPIT|Nunapitchuk||US|60.9056|-162.44|12|0|2
NUS|NVSP|Norsup||VU|-16.0797|167.401|23|345|2
NYU|VYBG|Bagan|Nyaung U|MM|21.1788|94.9302|312|256|2
NZG|UIUN|Nizhneangarsk||RU|55.8008|109.595|1545|207|2
OAL|SSKW|Cacoal||BR|-11.496|-61.4508|778|148|2
OBN|EGEO|Oban|North Connel|GB|56.4635|-5.3997|20|301|2
OBU|PAOB|Kobuk||US|66.9123|-156.897|137|53|2
OBX|AYOB|Obo||PG|-7.5906|141.324|29|0|2
ODN|WBGI|Long Seridan||MY|3.9761|115.067|607|219|2
ODO|UIKB|Bodaybo||RU|57.8661|114.243|919|207|2
ODY|VLOS|Oudomsay||LA|20.6827|101.994|1804|253|2
OES|SAVN|Antoine de Saint Exupéry|San Antonio Oeste|AR|-40.7512|-65.0343|85|64|2
OFU|NSAS|Ofu||AS|-14.1844|-169.67|9|362|2
OJU|WAFU|Tanjung Api|Tojo Una-Una|ID|-0.8654|121.629|49|0|2
OKR|YYKI|Yorke Island||AU|-9.7528|143.406|10|269|2
OLH||Old Harbor||US|57.2181|-153.27|55|0|2
OLJ|NVSZ|North West Santo|Olpoi|VU|-14.8817|166.558|50|345|2
OLP|YOLD|Olympic Dam||AU|-30.4839|136.877|344|268|2
ONG|YMTI|Mornington Island||AU|-16.6625|139.178|33|269|2
OOK|PAOO|Toksook Bay||US|60.5414|-165.087|59|140|2
OPP|SNSM|Salinópolis||BR|-0.6961|-47.3361|105|75|2
OPS|SBSI|Presidente João Batista Figueiredo|Sinop|BR|-11.885|-55.5861|1227|91|2
ORG|SMZO|Zorg en Hoop|Paramaribo|SR|5.8112|-55.1923|10|144|2
ORI||Port Lions||US|57.8849|-152.848|52|0|2
ORV|PFNO|Robert (Bob) Curtis Memorial|Noorvik|US|66.8179|-161.019|55|53|2
ORZ|MZTH|H.E Alfredo Martinez (Tower Hill) Airstrip|Orange Walk|BZ|18.0468|-88.5839|69|0|2
OSY|ENNM|Namsos||NO|64.4722|11.5786|7|308|2
OTD|MPRA|Raul Arias Espinoza|Contadora Island|PA|8.6288|-79.0347|43|0|2
OTS|K74S|Anacortes||US|48.4985|-122.662|241|122|2
OUI|LFEC|Ouessant|Ushant|FR|48.4632|-5.0636|142|309|2
PAS|LGPA|Paros||GR|37.0205|25.1132|131|280|2
PBJ|NVSI|Tavie|Paama Island|VU|-16.432|168.236|69|345|2
PCN|NZPN|Picton|Koromiko|NZ|-41.3461|173.956|161|340|2
PDB||Pedro Bay||US|59.7969|-154.13|45|0|2
PDM|MPPD|Capt. J. Montenegro|Pedasí|PA|7.5348|-80.0433|148|0|2
PEU|MHPL|Puerto Lempira||HN|15.2622|-83.7812|33|169|2
PFQ|OITP|Parsabad-Moghan||IR|39.6036|47.8815|251|247|2
PFR|FZVS|Ilebo||CD|-4.3299|20.5901|1450|34|2
PGM||Port Graham||US|59.3484|-151.83|93|0|2
PHO|PAPO|Point Hope||US|68.3488|-166.799|12|140|2
PIP|PAPN|Pilot Point||US|57.5804|-157.572|57|53|2
PJA|ESUP|Pajala||SE|67.2446|23.0749|542|320|2
PKA|PAPK|Napaskiak||US|60.7029|-161.778|24|53|2
PKG|WMPA|Pulau Pangkor|Pangkor Island|MY|4.2447|100.553|19|218|2
PKN|WAGI|Iskandar|Pangkalanbun|ID|-2.7052|111.673|75|232|2
PKP|NTGP|Puka Puka||PF|-14.8095|-138.813|5|368|2
PMK|YPAM|Palm Island||AU|-18.7553|146.581|28|269|2
PND|MZPG|Punta Gorda||BZ|16.1024|-88.8083|7|0|2
PPE|MMPE|Mar de Cortés|Puerto Peñasco|MX|31.352|-113.305|71|112|2
PPW|EGEP|Papa Westray|Papa Westray, Orkney Islands|GB|59.351|-2.9004|91|301|2
PQS||Pilot Station||US|61.9617|-162.942|473|0|2
PSY|SFAL|Port Stanley||FK|-51.6857|-57.7776|75|267|2
PTA|PALJ|Port Alsworth||US|60.2017|-154.326|280|53|2
PTF|NFFO|Malolo Lailai Island||FJ|-17.7784|177.197|10|346|2
PTO|SBPO|Juvenal Loureiro Cardoso|Pato Branco|BR|-26.2172|-52.6945|2697|159|2
PUR|SLPR|Puerto Rico|Puerto Rico/Manuripi|BO|-11.1077|-67.5512|597|120|2
PXH|YPMH|Prominent Hill|Mount Eba|AU|-29.716|135.524|745|0|2
PYT|SNZR|Pedro Rabelo de Souza|Paracatu|BR|-17.2426|-46.8831|2359|159|2
RAM|YRNG|Ramingining||AU|-12.3564|134.898|206|271|2
RBB|SWBR|Borba||BR|-4.4063|-59.6024|98|126|2
RBQ|SLRQ|Rurrenabaque||BO|-14.4279|-67.4968|676|120|2
RBV|AGRM|Ramata||SB|-8.1681|157.643|0|350|2
RCE|WA09|Roche Harbor||US|48.6123|-123.139|100|122|2
RCM|YRMD|Richmond||AU|-20.7019|143.115|676|269|2
RDV||Red Devil||US|61.7881|-157.35|174|0|2
RET|ENRS|Røst||NO|67.5265|12.1016|7|308|2
RHT|ZBAR|Alxa Right Banner Badanjilin||CN|39.225|101.546|4659|241|2
RIH|MPSM|Scarlett Martinez|Río Hato|PA|8.3759|-80.1279|105|143|2
RJM|WASN|Marinda|Waisai|ID|-0.425|130.774|9|0|2
RKI|WIEB|Mentawai|Sipura Island|ID|-2.1001|99.7044|26|0|2
RMP|PFMP|Rampart||US|65.5079|-150.141|302|0|2
RMT|NTAM|Rimatara|Rimatara Island|PF|-22.6373|-152.806|60|0|2
RNI|MNCI|Corn Island||NI|12.1748|-83.0594|1|125|2
RNL|AGGR|Rennell/Tingoa|Rennell Island|SB|-11.55|160.063|550|350|2
RNP||Rongelap Island||MH|11.1572|166.887|0|0|2
RRR|NTKO|Raroia||PF|-16.0505|-142.477|18|368|2
RSH|PARS|Russian Mission||US|61.7751|-161.32|51|53|2
RTA|NFNR|Rotuma||FJ|-12.4825|177.071|22|346|2
RTG|WATG|Frans Sales Lega|Satar Tacik, Manggarai|ID|-8.5962|120.478|3510|223|2
RTI|WATR|David Constantijn Saudale|Ba'a - Rote Island|ID|-10.7658|123.076|470|0|2
RUL|VRQM|Maavaarulaa|Maavaarulu|MV|0.3381|73.5129|28|335|2
RUS|AGGU|Marau||SB|-9.8617|160.825|3|350|2
RVE|SKSA|Los Colonizadores|Saravena|CO|6.9519|-71.8572|680|79|2
RVV|NTAV|Raivavae||PF|-23.8852|-147.662|7|368|2
RYO|SAWT|28 de Noviembre|Rio Turbio|AR|-51.605|-72.2203|909|63|2
SBR|YSII|Saibai Island||AU|-9.3783|142.625|15|269|2
SCM|PACM|Scammon Bay||US|61.8447|-165.575|14|140|2
SCY|SEST|San Cristóbal|Puerto Baquerizo Moreno|EC|-0.9102|-89.6174|62|348|2
SCZ|AGGL|Santa Cruz/Graciosa Bay/Luova||SB|-10.7203|165.795|18|350|2
SDN|ENSD|Sandane Airport, Anda||NO|61.83|6.1058|196|308|2
SET|SNHS|Santa Magalhães|Serra Talhada|BR|-8.0614|-38.3289|1542|152|2
SEU|HTSN|Seronera||TZ|-2.4581|34.8225|5080|17|2
SFC|TFFC|St-François||GP|16.2578|-61.2625|10|106|2
SFL|GVSF|São Filipe||CV|14.885|-24.48|617|262|2
SGO|YSGE|St George||AU|-28.0497|148.595|656|269|2
SGY|PAGY|Skagway||US|59.4603|-135.317|44|117|2
SHC|HASR|Shire Inda Selassie||ET|14.0757|38.2736|6207|3|2
SHF|ZWHZ|Shihezi Huayuan||CN|44.2421|85.8905|1700|0|2
SHG|PAGH|Shungnak||US|66.8881|-157.162|197|53|2
SHH|PASH|Shishmaref||US|66.2496|-166.089|12|140|2
SHY|HTSY|Shinyanga||TZ|-3.6093|33.5035|3800|17|2
SIF|VNSI|Simara||NP|27.1598|84.98|450|214|2
SIH|VNDT|Silgadi Doti||NP|29.2622|80.936|2100|214|2
SKH|VNSK|Surkhet||NP|28.586|81.636|2400|214|2
SKK|PFSH|Shaktoolik||US|64.3711|-161.224|24|53|2
SKU|LGSY|Skiros|Skiros Island|GR|38.9676|24.4872|44|280|2
SLH|NVSC|Sola||VU|-13.8517|167.537|7|345|2
SLI|FLSW|Solwesi||ZM|-12.1737|26.3651|4551|35|2
SLQ|PASL|Sleetmute||US|61.7005|-157.166|190|53|2
SLX|MBSY|Salt Cay||TC|21.333|-71.2|3|104|2
SMK|PAMK|St Michael||US|63.4901|-162.11|98|140|2
SMQ|WAGS|Sampit (H.Asan)||ID|-2.4992|112.975|50|232|2
SMT|SBSO|Adolino Bedin|Sorriso|BR|-12.4792|-55.6723|1266|0|2
SNX|OIIS|Semnan||IR|35.5911|53.4951|3665|247|2
SOD|SDCO|Sorocaba||BR|-23.478|-47.49|2083|159|2
SOG|ENSG|Sogndal Airport, Haukåsen||NO|61.1561|7.1378|1633|308|2
SOV|PASO|Seldovia||US|59.443|-151.705|29|53|2
SOY|EGER|Stronsay||GB|59.1553|-2.6414|39|301|2
SRA|SSZR|Luis Alberto Lehr|Santa Rosa|BR|-27.9066|-54.5206|1014|159|2
SRL||Palo Verde|Mulegé|MX|27.0927|-112.099|127|0|2
SRV||Stony River 2||US|61.7897|-156.589|230|0|2
SSR|NVSH|Sara|Pentecost Island|VU|-15.4708|168.152|493|345|2
SSW|7WA5|Stuart Island Airpark|Friday Harbor|US|48.6734|-123.175|10|122|2
SUK|UEBS|Sakkyryr|Batagay-Alyta|RU|67.792|130.394|1686|0|2
SUR|CJV7|Summer Beaver||CA|52.7086|-88.5419|832|172|2
SUY|UENS|Suntar||RU|62.185|117.635|452|255|2
SVS|PFSV|Stevens Village||US|66.0167|-149.057|328|0|2
SVU|NFNS|Savusavu||FJ|-16.8034|179.341|17|346|2
SWL|RPSV|San Vicente||PH|10.5243|119.273|24|0|2
SWQ|WADS|Sultan Muhammad Kaharuddin III|Sumbawa Besar|ID|-8.489|117.412|16|223|2
SWX|FBSW|Shakawe||BW|-18.3739|21.8326|3379|22|2
SXK|WAPS|Mathilda Batlayeri|Saumlaki-Yamdena Island|ID|-7.8484|131.337|446|209|2
SXP||Nunam Iqua||US|62.5206|-164.848|12|0|2
SYM|ZPSM|Pu'er Simao||CN|22.7933|100.959|0|241|2
SYU|YWBS|Warraber Island|Sue Islet|AU|-10.2083|142.825|3|269|2
SZE|HASM|Semera||ET|11.7875|40.9915|1390|3|2
SZI|UASZ|Zaysan||KZ|47.4875|84.8877|1877|0|2
TAL|PATA|Ralph M Calhoun Memorial|Tanana|US|65.1744|-152.109|236|53|2
TBG|AYTB|Tabubil||PG|-5.2805|141.228|1570|365|2
TBM|WAGT|Tumbang Samba|Tumbang Samba-Borneo Island|ID|-1.469|113.081|160|0|2
TBO|HTTB|Tabora||TZ|-5.0764|32.8333|3868|17|2
TCD|SKRA|Tarapacá||CO|-2.8958|-69.7498|253|0|2
TCG|ZWTC|Tacheng Qianquan||CN|46.6725|83.3408|0|241|2
TCR|VOTK|Tuticorin|Vagaikulam|IN|8.7242|78.0258|129|216|2
TCT|PPCT|Takotna||US|62.9932|-156.029|825|0|2
TDS|AYSS|Sasereme||PG|-7.6217|142.868|121|365|2
TEK|PAKA|Tatitlek||US|60.8714|-146.69|62|0|2
TFI|AYTU|Tufi||PG|-9.076|149.32|85|365|2
TGH|NVST|Tongoa|Tongoa Island|VU|-16.8911|168.551|443|345|2
TGQ|SWTS|Tangará da Serra||BR|-14.662|-57.4437|1473|91|2
THD|VVTX|Tho Xuan|Thanh Hóa|VN|19.9017|105.468|59|190|2
THO|BITN|Þórshöfn||IS|66.2185|-15.3347|65|265|2
THX|UOTT|Turukhansk||RU|65.7972|87.9353|128|217|2
TIE|HATP|Tippi||ET|7.2024|35.415|1100|3|2
TIZ|AYTA|Tari||PG|-5.845|142.948|5500|365|2
TJL|SBTG|Plínio Alarcom|Três Lagoas|BR|-20.7526|-51.682|1063|82|2
TJQ|WIKT|H A S Hanandjoeddin|Tanjung Pandan|ID|-2.7441|107.754|164|208|2
TJS|WAGD|Tanjung Harapan|Tanjung Selor-Borneo Island|ID|2.8381|117.375|20|223|2
TKJ|PFTO|Tok Junction||US|63.3295|-142.954|1639|53|2
TKM|UIKG|Taksimo||RU|56.3617|114.93|1634|0|2
TKQ|HTKA|Kigoma||TZ|-4.8862|29.6709|2700|17|2
TKV|NTGO|Tatakoto||PF|-17.3552|-138.447|12|368|2
TLA|PATE|Teller||US|65.2404|-166.339|294|140|2
TLI|WAFL|Sultan Bantilan|Toli Toli-Celebes Island|ID|1.1234|120.794|17|223|2
TLT|PALT|Tuluksak||US|61.087|-160.923|30|0|2
TLU|SKTL|Golfo de Morrosquillo|Santiago de Tolú|CO|9.5094|-75.5854|16|79|2
TLY|UHWP|Plastun||RU|44.815|136.292|66|254|2
TMC|WATK|Tambolaka|Radamata|ID|-9.4092|119.243|161|223|2
TMF|VRNT|Thimarafushi||MV|2.211|73.1533|6|335|2
TMG|WBKM|Tomanggong||MY|5.4026|118.658|26|219|2
TMI|VNTR|Tumling Tar||NP|27.315|87.1933|1700|214|2
TNC|PATC|Tin City Long Range Radar Station||US|65.5631|-167.922|271|140|2
TNK|POKA|Tununak||US|60.5696|-165.247|14|0|2
TOG|PATG|Togiak|Togiak Village|US|59.0528|-160.397|21|53|2
TOW|SBTD|Toledo - Luiz Dalcanale Filho||BR|-24.6863|-53.6975|1843|159|2
TPI|AYTI|Tapini||PG|-8.3567|146.989|3100|365|2
TTS|FMNT|Tsaratanana||MG|-16.7511|47.619|1073|330|2
TVS|ZBSN|Tangshan Sannühe|Tangshan (Fengrun)|CN|39.7178|118.003|50|241|2
TVU|NFNM|Matei||FJ|-16.6906|-179.877|60|346|2
TWA||Twin Hills||US|59.0747|-160.275|82|0|2
TWC|ZWTS|Tumxuk Tangwangcheng||CN|39.8867|79.2334|3566|241|2
UAH|NTMU|Ua Huka||PF|-8.9362|-139.554|160|357|2
UAP|NTMP|Ua Pou||PF|-9.3517|-140.078|16|357|2
UBB|YMAA|Mabuiag Island||AU|-9.9502|142.195|0|269|2
UII|MHUT|Utila|Utila Island|HN|16.1131|-86.8803|29|169|2
UIT||Jaluit|Jabor Jaluit Atoll|MH|5.9092|169.637|4|0|2
UJE||Ujae Atoll||MH|8.9281|165.762|29|356|2
UKG|UEBT|Ust-Kuyga||RU|70.011|135.645|327|254|2
ULZ|ZMDN|Donoi|Uliastai|MN|47.7093|96.5258|5800|0|2
UMS|UEMU|Ust-Maya||RU|60.3574|134.437|561|215|2
UMU|SSUM|Orlando de Carvalho|Umuarama|BR|-23.7987|-53.3138|1552|159|2
UNA|SBTC|Una-Comandatuba||BR|-15.3544|-38.9987|23|72|2
UNG|AYKI|Kiunga||PG|-6.1257|141.282|88|365|2
UOL|WAFY|Buol - Pogogul||ID|1.1023|121.413|49|223|2
USJ|UAAL|Usharal||KZ|46.1908|80.8309|1288|180|2
UTK||Utirik|Utirik Island|MH|11.2222|169.851|4|0|2
UVI|SSUV|José Cleto|União da Vitória|BR|-26.2332|-51.0668|2467|159|2
UZR|UASU|Urzhar||KZ|47.0918|81.6682|0|0|2
VAK|PAVA|Chevak||US|61.5409|-165.601|75|140|2
VAL|SNVB|Valença||BR|-13.2965|-38.9924|21|72|2
VAO|AGGV|Suavanao||SB|-7.5856|158.731|20|350|2
VBV|NFVB|Vanua Balavu||FJ|-17.269|-178.976|76|346|2
VCL|VVCA|Chu Lai|Tam Nghĩa|VN|15.4033|108.706|10|204|2
VEE|PAVE|Venetie||US|67.0087|-146.366|574|53|2
VHV|UENI|Verkhnevilyuisk||RU|63.4581|120.269|411|255|2
VJB|FQXA|Xai-Xai Chongoene||MZ|-24.8929|33.753|291|37|2
VLS|NVSV|Valesdir|Epi Island|VU|-16.7961|168.177|10|345|2
VSV|VISV|Shravasti||IN|27.4997|82.0329|366|216|2
WAA|PAIW|Wales||US|65.6226|-168.095|22|140|2
WBB||Stebbins||US|63.516|-162.278|14|0|2
WBQ|PAWB|Beaver||US|66.3622|-147.407|359|53|2
WDN|90WA|Waldron Airstrip|Eastsound|US|48.7114|-123.018|140|122|2
WGP|WATU|Umbu Mehang Kunda|Waingapu-Sumba Island|ID|-9.6692|120.302|33|223|2
WLH|NVSW|Walaha||VU|-15.412|167.691|151|345|2
WLK|PASK|Selawik||US|66.6001|-159.986|17|53|2
WMO|PAWM|White Mountain||US|64.6892|-163.413|267|140|2
WNA|PANA|Napakiak||US|60.6903|-161.979|17|53|2
WNH|ZPWS|Wenshan Puzhehei||CN|23.5583|104.326|5217|0|2
WNN|CKL3|Wunnumin Lake||CA|52.8939|-89.2892|819|176|2
WRY|EGEW|Westray|Westray, Orkney Islands|GB|59.3505|-2.9501|29|301|2
WSK|ZUWS|Chongqing Wushan||CN|31.069|109.709|0|241|2
WSN|PFWS|South Naknek Number 2||US|58.7024|-157.005|162|53|2
WTA|FMMU|Tambohorano||MG|-17.4761|43.9728|23|330|2
WTE||Wotje||MH|9.4583|170.239|4|0|2
WTK|PAWN|Noatak||US|67.5612|-162.981|88|140|2
WTL||Tuntutuliak||US|60.3512|-162.655|16|0|2
WTO||Wotho Island||MH|10.1733|166.003|0|0|2
WUT|ZBXZ|Xinzhou Wutaishan||CN|38.5975|112.969|2527|0|2
WWT|PAEW|Mertarvik||US|60.8104|-164.5|346|140|2
WXN|ZUWX|Wanzhou Wuqiao||CN|30.8017|108.433|0|241|2
XBE|CNE3|Bearskin Lake||CA|53.9656|-91.0272|800|176|2
XGR|CYLU|Kangiqsualujjuaq (Georges River)||CA|58.7114|-65.9928|215|172|2
XKH|VLXK|Xieng Khouang||LA|19.45|103.158|3445|253|2
XLB|CZWH|Lac Brochet||CA|58.6143|-101.469|1211|176|2
XMY|YYMI|Yam Island||AU|-9.8992|142.774|0|269|2
XPK|CZFG|Pukatawagan||CA|55.7492|-101.266|958|176|2
XSI|CZSN|South Indian Lake||CA|56.7928|-98.9072|951|176|2
XTL|CYBQ|Tadoule Lake||CA|58.7063|-98.5111|923|176|2
XYA|AGGY|Yandina||SB|-9.0928|159.218|60|350|2
YAB|CYAB|Arctic Bay||CA|73.0061|-85.0462|72|151|2
YAC|CYAC|Cat Lake||CA|51.7272|-91.8244|1344|176|2
YAL|CYAL|Alert Bay||CA|50.5822|-126.916|240|174|2
YAS|NFSW|Yasawa Island||FJ|-16.7589|177.545|29|346|2
YAT|CYAT|Attawapiskat||CA|52.9275|-82.4319|31|172|2
YAX|CKB6|Wapekeka|Angling Lake|CA|53.8492|-89.5794|712|176|2
YBB|CYBB|Kugaaruk||CA|68.5357|-89.8055|56|81|2
YBE|CYBE|Uranium City||CA|59.5614|-108.481|1044|168|2
YBI|CCE4|Black Tickle||CA|53.4698|-55.7875|57|163|2
YBT|CYBT|Brochet||CA|57.8894|-101.679|1136|176|2
YBV|CYBV|Berens River||CA|52.3589|-97.0183|728|176|2
YCK|CYVL|Tommy Kochon|Colville Lake|CA|67.0202|-126.128|870|114|2
YCO|CYCO|Kugluktuk||CA|67.8164|-115.143|74|81|2
YCR|CYCR|Cross Lake (Charlie Sinclair Memorial)||CA|54.6098|-97.7624|709|176|2
YCS|CYCS|Chesterfield Inlet||CA|63.3469|-90.7311|32|151|2
YCY|CYCY|Clyde River||CA|70.4861|-68.5167|87|115|2
YDL|CYDL|Dease Lake||CA|58.4222|-130.032|2600|174|2
YDP|CYDP|Nain||CA|56.5508|-61.6822|22|103|2
YDV|CZTA|Bloodvein River||CA|51.7846|-96.6923|721|176|2
YEK|CYEK|Arviat||CA|61.0942|-94.0708|32|151|2
YER|CYER|Fort Severn||CA|56.0189|-87.6761|48|172|2
YFA|CYFA|Fort Albany||CA|52.2035|-81.6952|48|172|2
YFH|CYFH|Fort Hope||CA|51.5619|-87.9078|899|172|2
YFJ|CYWE|Wekweètì||CA|64.1908|-114.077|1208|98|2
YFO|CYFO|Flin Flon||CA|54.6781|-101.682|997|176|2
YFX|CCK4|St. Lewis (Fox Harbour)||CA|52.3728|-55.6739|74|163|2
YGH|CYGH|Fort Good Hope||CA|66.2407|-128.648|268|114|2
YGO|CYGO|Gods Lake Narrows||CA|54.5577|-94.4901|617|176|2
YGT|CYGT|Igloolik||CA|69.3647|-81.8161|174|115|2
YGX|CYGX|Gillam||CA|56.3571|-94.7115|476|176|2
YGZ|CYGZ|Grise Fiord||CA|76.4258|-82.9086|146|115|2
YHA|CCP4|Port Hope Simpson||CA|52.5281|-56.2861|347|163|2
YHG|CCH4|Charlottetown||CA|52.7658|-56.1124|209|163|2
YHI|CYHI|Ulukhaktok Holman||CA|70.7628|-117.806|117|98|2
YHK|CYHK|Gjoa Haven||CA|68.6356|-95.8497|152|81|2
YHO|CYHO|Hopedale||CA|55.4488|-60.2281|39|103|2
YHP|CYHP|Poplar Hill||CA|52.1133|-94.2556|1095|176|2
YHR|CYHR|Chevery||CA|50.4683|-59.6378|39|77|2
YIK|CYIK|Ivujivik||CA|62.4173|-77.9253|126|115|2
YIO|CYIO|Pond Inlet||CA|72.6895|-77.9689|181|115|2
YKG|CYAS|Kangirsuk||CA|60.0272|-69.9992|403|172|2
YKQ|CYKQ|Waskaganish||CA|51.4733|-78.7583|80|115|2
YKU|CSU2|Chisasibi||CA|53.8056|-78.9169|43|172|2
YLC|CYLC|Kimmirut||CA|62.8483|-69.8779|175|115|2
YLE|CEM3|Whatì||CA|63.1317|-117.246|882|98|2
YLH|CYLH|Lansdowne House||CA|52.1956|-87.9342|834|172|2
YMH|CYMH|Mary's Harbour||CA|52.3028|-55.8474|38|163|2
YMN|CYFT|Makkovik||CA|55.0773|-59.1879|234|103|2
YMP|CAT5|Port McNeill||CA|50.5735|-127.028|225|174|2
YNC|CYNC|Wemindji||CA|53.0106|-78.8311|66|115|2
YNE|CYNE|Norway House||CA|53.9583|-97.8442|734|176|2
YNO|CKQ3|North Spirit Lake||CA|52.49|-92.9711|1082|176|2
YNP|CNH2|Natuashish||CA|55.9139|-61.1844|30|103|2
YNS|CYHH|Nemiscau||CA|51.6911|-76.1356|802|172|2
YOC|CYOC|Old Crow||CA|67.5706|-139.839|824|93|2
YOG|CYKP|Ogoki Post||CA|51.6586|-85.9017|594|172|2
YOH|CYOH|Oxford House||CA|54.9333|-95.2789|663|176|2
YON|VQTY|Yongphulla||BT|27.2563|91.5146|9000|0|2
YPC|CYPC|Paulatuk (Nora Aliqatchialuk Ruben)||CA|69.3608|-124.076|15|114|2
YPH|CYPH|Inukjuak||CA|58.4719|-78.0769|83|172|2
YPJ|CYLA|Aupaluk||CA|59.2967|-69.5997|119|172|2
YPM|CYPM|Pikangikum||CA|51.8197|-93.9733|1114|176|2
YPO|CYPO|Peawanuck||CA|54.9879|-85.4426|173|172|2
YQC|CYHA|Quaqtaq||CA|61.0464|-69.6178|103|115|2
YRA|CYRA|Rae Lakes|Gamètì|CA|64.1161|-117.31|723|98|2
YRF|CYCA|Cartwright||CA|53.6825|-57.0423|40|103|2
YRG|CCZ2|Rigolet||CA|54.1797|-58.4575|180|103|2
YRS|CYRS|Red Sucker Lake||CA|54.1672|-93.5572|729|176|2
YSG|CYLK|Lutselk'e||CA|62.4178|-110.683|596|98|2
YSK|CYSK|Sanikiluaq||CA|56.5369|-79.2502|104|115|2
YSO|CCD4|Postville||CA|54.9105|-59.7851|193|103|2
YST|CYST|St. Theresa Point||CA|53.8453|-94.852|773|176|2
YSY|CYSY|Sachs Harbour (David Nasogaluak Jr. Saaryuaq)||CA|71.9939|-125.243|282|114|2
YTE|CYTE|Cape Dorset|Kinngait|CA|64.23|-76.5267|164|115|2
YTL|CYTL|Big Trout Lake||CA|53.8178|-89.8969|729|176|2
YTQ|CYTQ|Tasiujaq||CA|58.6678|-69.9558|122|172|2
YTW|ZWYT|Yutian Wanfang|Hotan (Yutian)|CN|36.8085|81.7827|4731|241|2
YUD|CYMU|Umiujaq||CA|56.5361|-76.5183|250|115|2
YUT|CYUT|Naujaat|Repulse Bay|CA|66.521|-86.2252|80|151|2
YVM|CYVM|Qikiqtarjuaq||CA|67.5466|-64.0314|21|115|2
YVZ|CYVZ|Deer Lake||CA|52.6556|-94.0612|1092|176|2
YWB|CYKG|Kangiqsujuaq (Wakeham Bay)||CA|61.5886|-71.9294|501|172|2
YWJ|CYWJ|Déline||CA|65.2111|-123.436|703|114|2
YWM|CCA6|Williams Harbour||CA|52.5674|-55.7849|70|163|2
YWP|CYWP|Webequie||CA|52.9594|-87.3749|685|172|2
YXN|CYXN|Whale Cove||CA|62.24|-92.5981|40|151|2
YXP|CYXP|Pangnirtung||CA|66.1449|-65.7136|75|115|2
YYH|CYYH|Taloyoak||CA|69.5467|-93.5767|92|81|2
YZG|CYZG|Salluit||CA|62.1794|-75.6672|743|172|2
YZZ|CAD4|Trail||CA|49.0556|-117.609|1427|174|2
ZDY|OMDL|Delma|Delma Island|AE|24.51|52.3352|30|0|2
ZEM|CZEM|Eastmain River||CA|52.2264|-78.5225|24|115|2
ZFD|CZFD|Fond-du-Lac||CA|59.3344|-107.182|814|168|2
ZFL|ZWZS|Zhaosu Tianma||CN|43.0885|81.223|0|241|2
ZFM|CZFM|Fort Mcpherson||CA|67.407|-134.86|116|114|2
ZFN|CZFN|Tulita||CA|64.9095|-125.57|332|114|2
ZGI|CZGI|Gods River||CA|54.8397|-94.0786|627|176|2
ZGS|CTT5|La Romaine|Le Golfe-du-Saint-Laurent|CA|50.2596|-60.6744|90|77|2
ZKE|CZKE|Kashechewan||CA|52.2825|-81.6778|35|172|2
ZLT|CTU5|La Tabatière||CA|50.8308|-58.9756|102|77|2
ZPB|CZPB|Sachigo Lake||CA|53.8909|-92.1959|876|176|2
ZPC|SCPC|Pucón|Pucon|CL|-39.2928|-71.9159|853|157|2
ZRJ|CZRJ|Round Lake (Weagamow Lake)||CA|52.9436|-91.3128|974|176|2
ZTB|CTB6|Tête-à-la-Baleine||CA|50.6744|-59.3836|107|77|2
ZTM|CZTM|Shamattawa||CA|55.8636|-92.0811|289|176|2
ZUM|CZUM|Churchill Falls||CA|53.5619|-64.1064|1442|103|2
ZWL|CZWL|Wollaston Lake||CA|58.1069|-103.172|1360|153|2`;
