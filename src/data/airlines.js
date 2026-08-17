/* Airline IATA -> ICAO callsign prefix — OpenFlights (ODbL) plus manual corrections */
const AL_RAW=`&T|T&O|Tom\\\\'s & co airliners
++|---|Lombards Air
-+|--+|U.S. Air
--|ELK|ELK Airways
..|...|Avilu
00|000|AirOne Continental
04|ABV|Antrak Air
07|770|Samurai Airlines
0A|GNT|Amber Air
0B|JOR|Blue Air
0D|DWT|Darwin Airline
0G|GA0|Global Airlines
0J|JCS|Jetclub
0M|0MM|All America MX
0P|PYB|All America BOPY
0X|CX0|Copenhagen Express
0Y|7ZC|All America CO
10|CNN|Canadian World
12|N12|12 North
13|EAV|Eastern Atlantic Virtual Airlines
1A|AGT|Amadeus Global Travel Distribution
1C|1CH|OneChina
1E|RGG|TransRussiaAirlines
1F|CIF|CB Airways UK ( Interliging Flights )
1H|HEY|Hellenic Airways
1I|EJA|NetJets
1K|BG1|BudgetAir
1L|OSY|Open Skies Consultative Commission
1R|R1R|All America CL
1T|RNX|1Time Airline
1Y|A9B|All America BR
20|RNE|Air Salone
2B|ARD|Aerocondor
2D|AOG|Aero VIP
2F|FTA|Frontier Flying Service
2G|CRG|Cargoitalia
2J|VBW|Air Burkina
2K|GLG|Aerolineas Galapagos (Aerogal)
2L|OAW|Helvetic Airways
2M|MDV|Moldavian Airlines
2N|NTJ|NextJet
2P|GAP|Air Philippines
2Q|SNC|Air Cargo Carriers
2R|M7A|All America AR
2S|SDY|Island Express
2T|HAM|Haiti Ambassador Airlines
2U|GIP|Air Guinee Express
2W|WLC|Welcome Air
2X|2K2|Regionalia Uruguay
2Y|AOW|Air Andaman (2Y)
2Z|CGN|Changan Airlines
3C|CEA|RegionsAir
3D|PMK|Palair Macedonia
3F|3FF|Fly Colombia ( Interliging Flights )
3G|AYZ|Atlant-Soyuz Airlines
3J|WZP|Zip
3K|JSA|Jetstar Asia Airways
3L|ISK|Intersky
3N|URG|Air Urga
3P|TNM|Tiara Air
3Q|CYH|Yunnan Airlines
3R|GAI|Moskovia Airlines
3T|URN|Turan Air
3U|CSC|Sichuan
3V|TAY|TNT Airways
3W|EMX|Euromanx Airways
3X|GUI|Aguilar Connect
47|VVN|88
4A|AKL|Air Kiribati
4B|BTQ|Boutique Air (Priv)
4C|ARE|Aires
4D|ASD|Air Sinai
4F|ECE|Air City
4G|GZP|Gazpromavia
4H|UBD|United Airways
4K|AAS|Askari Aviation
4L|MJX|Euroline
4M|DSM|LAN Argentina
4N|ANT|Air North Charter - Canada
4R|HHI|Hamburg International
4S|VI4|Vuola Italia
4T|BHP|Belair Airlines
4U|GWI|Germanwings
4Y|RBU|Airbus France
5A|AIP|Alpine Air Express
5B|BSX|Bassaka airlines
5C|ICL|CAL Cargo Air Lines
5D|SLI|Aerolitoral
5F|CIR|Arctic Circle Air Service
5G|SSV|Skyservice Airlines
5H|FFV|Fly540
5J|CEB|Cebu Pacific
5K|HFY|Hi Fly
5L|RSU|Aerosur
5M|SIB|Sibaviatrans
5N|AUL|Aeroflot-Nord
5T|MPE|Canadian North
5V|UKW|Lviv Airlines
5W|AEU|Astraeus
5X|UPS|United Parcel Service
5Y|GTI|Atlas Air
5Z|VVC|VivaColombia
6A|CHP|Consorcio Aviaxsa
6B|BLX|TUIfly Nordic
6C|6CC|Vuela Cuba
6E|IGO|IndiGo
6F|MKD|MAT Airways
6G|AWW|Air Wales
6H|ISR|Israir
6I|IBZ|International Business Air
6J|SNJ|Skynet Asia Airways
6K|RIT|Asian Spirit
6N|NRD|Nordic Regional
6P|ISG|Club Air
6Q|SLL|Slovak Airlines
6R|DRU|Alrosa Mirny Air Enterprise
6U|UKR|Air Ukraine
6V|CZV|Via Conectia Airlines
6W|SOV|Saratov Aviation Division
6Z|UKS|Ukrainian Cargo Airways
76|SJS|Southjet
77|ZCS|Southjet connect
78|XAN|Southjet cargo
7B|KJC|Krasnojarsky Airlines
7C|JJA|Jeju Air
7E|AWU|Aeroline GmbH
7F|FAB|First Air
7G|SFJ|Star Flyer
7H|ERR|Era Alaska
7K|KGL|Kogalymavia Air Company
7L|ERO|Sun D'Or
7M|ZTF|Mongolian International Air Lines
7N|CNA|Centavia
7O|7KK|All Colombia
7P|BTV|Metro Batavia
7R|SJM|Svyaz Rossiya
7T|AGV|Air Glaciers
7V|ROB|ROYAL BRITAIN
88|8K8|All Australia
8A|BMM|Atlas Blue
8B|BCC|BusinessAir
8C|ATN|Air Transport International
8D|EXV|Expo Aviation
8E|BRG|Bering Air
8F|STP|STP Airways
8H|HFR|Heli France
8J|JFU|Jet4You
8K|K88|Voestar
8L|CGP|Cargo Plus Aviation
8M|MXL|Maxair
8N|NKF|Barents AirLink
8P|PCO|Pacific Coastal Airline
8Q|OHY|Onur Air
8R|TIB|TRIP Linhas A
8U|AAW|Afriqiyah Airways
8V|ACP|Astral Aviation
8W|PWF|Private Wings Flugcharter
8Y|PBU|Air Burundi
8Z|WVL|Wizz Air Hungary
9A|99F|All Africa
9C|CQH|Spring
9E|FLG|Pinnacle Airlines
9F|TLM|Tramm Airlines
9I|INE|International Europe
9J|CR1|Regionalia Chile
9K|KAP|Cape Air
9L|CJC|Colgan Air
9N|N78|Regional Air Iceland
9Q|PBA|PB Air
9R|NSE|SATENA
9S|CQH|Spring Airlines
9T|ABS|Transwest Air
9U|MLD|Air Moldova
9V|VC9|Volotea Costa Rica
9W|JAI|Jet Airways
9X|9XX|Regionalia Venezuela
9Y|KZK|Air Kazakhstan
::|:::|Llloyd Helicopters
??|???|Court Line
A1|A1F|Atifly
A2|AL2|All America
A3|AEE|Aegean
A4|SWD|Southern Winds Airlines
A5|HOP|Air France Hop
A6|LPV|Air Alps Aviation
A7|MPD|Air Plus Comet
A8|BGL|Benin Golf Air
A9|TGZ|Georgian Airways
AA|AAL|American Airlines
AB|BER|Air Berlin
AC|ACA|Air Canada
AD|AZU|Azul
AE|MDA|Mandarin Airlines
AF|AFR|Air France
AG|SSA|All America US
AH|DAH|Air Algerie
AI|AIC|Air India
AJ|NIG|Aero Contractors
AK|AXM|AirAsia
AL|SYX|Skywalk Airlines
AM|AMX|Aeromexico
AN|AAA|Ansett Australia
AO|AUZ|Australian Airlines
AP|MSV|AlbaStar
AQ|AAH|Aloha Airlines
AR|ARG|Aerolineas Argentinas
AS|ASA|Alaska Airlines
AT|RAM|Royal Air Maroc
AU|AUT|Austral Lineas Aereas
AV|AVA|Avianca
AW|AWM|Asian Wings Airways
AX|LOF|Trans States Airlines
AY|FIN|Finnair
AZ|ITY|ITA Airways
B0|666|Aws express
B1|BA1|Baltic Air lines
B2|BRU|Belavia Belarusian Airlines
B3|BLV|Bellview Airlines
B4|GSM|Flyglobespan
B5|FLT|Flightline
B6|JBU|JetBlue
B7|UIA|Uni Air
B8|ERT|Eritrean Airlines
B9|BGD|Air Bangladesh
BA|BAW|British Airways
BB|SBS|Seaborne Airlines
BC|SKY|Skymark Airlines
BD|BMA|bmi
BE|BEE|Flybe
BF|RSR|Aero-Service
BG|BBC|Biman Bangladesh Airlines
BI|RBA|Royal Brunei Airlines
BJ|LBT|Nouvel Air Tunisie
BK|PDC|Potomac Air
BL|PIC|Jetstar Pacific
BM|BYE|Bayu Indonesia Air
BN|HZA|Horizon Airlines
BO|BOU|Bouraq Indonesia Airlines
BP|BOT|Air Botswana
BQ|BQB|Buquebus Líneas Aéreas
BR|EVA|EVA Air
BS|BIH|British International Helicopters
BT|BTI|airBaltic
BU|BUU|Baikotovitchestrian Airlines
BV|BPA|Blue Panorama
BW|BWA|Caribbean Airlines
BX|ABL|Air Busan
BY|TOM|TUI Airways
BZ|BSA|Black Stallion Airways
C0|CLW|Centralwings
C1|CA1|CanXpress
C2|CAP|CanXplorer
C3|KIS|Contact Air
C4|LIX|LionXpress
C5|UCA|CommutAir
C6|CJA|CanJet
C7|CR7|Sky Wing Pacific
C8|WDY|Chicago Express
C9|RUS|Cirrus Airlines
CA|CCA|Air China
CB|CCC|CCML Airlines
CC|ABD|Air Atlanta Icelandic
CD|LLR|Alliance Air
CE|NTW|Nationwide Airlines
CF|SDR|City Airline
CG|TOK|Airlines PNG
CH|BMJ|Bemidji Airlines
CI|CAL|China Airlines
CJ|CFE|BA CityFlyer
CK|CKK|China Cargo Airlines
CL|CLH|Lufthansa CityLine
CM|CMP|Copa
CN|YCP|Canadian National Airways
CO|COA|Continental Airlines
CP|CDN|Canadian Airlines
CQ|KOL|SOCHI AIR
CS|CMI|Continental Micronesia
CT|CAT|Civil Air Transport
CU|CUB|Cubana de Aviación
CV|CVA|Air Chathams
CW|CWM|Air Marshall Islands
CX|CPA|Cathay Pacific
CY|CYP|Cyprus Airways
CZ|CSN|China Southern
D1|MDO|Domenican Airlines
D3|DAO|Daallo Airlines
D4|LID|Alidaunia
D5|DAU|Dauair
D6|ILN|Interair South Africa
D7|XAX|AirAsia X
D8|IBK|Norwegian Intl
D9|DNV|Aeroflot-Don
DA|GRG|Air Georgia
DB|BZH|Brit Air
DC|GAO|Golden Air
DD|NOK|Nok Air
DE|CFG|Condor
DF|MJG|Michael Airlines
DG|SRQ|South East Asian Airlines
DH|DSY|Dennis Sky
DI|BAG|dba
DJ|PBN|Pacific Blue
DK|ELA|Eastland Air
DL|DAL|Delta Air Lines
DN|SGG|Senegal Airlines
DO|DOA|Dominicana de Aviaci
DP|PBD|Pobeda
DR|BIE|Air Mediterranee
DT|DTA|TAAG Angola Airlines
DU|NLH|Norwegian Long Haul AS
DV|VSV|Scat Air
DW|UCR|Aero-Charter Ukraine
DX|DTR|DAT Danish Air Transport
DY|NOZ|Norwegian
E0|ESS|Eos Airlines
E1|ES2|Usa Sky Cargo
E2|KMP|Kampuchea Airlines
E3|DMO|Domodedovo Airlines
E4|GIE|Elysian Airlines
E5|RBG|Air Arabia Egypt
E7|ESF|Estafeta Carga Aerea
E8|GTA|City Airways
E9|CXS|Boston-Maine Airways
EA|EAL|European Air Express
EC|TWN|Avialeasing Aviation Company
ED|ABQ|Airblue
EE|EAY|Aero Airlines
EF|EFA|Far Eastern Air Transport
EG|JAA|Japan Asia Airways
EH|AKX|Air Nippon Network Co. Ltd.
EI|EIN|Aer Lingus
EJ|NEA|New England Airlines
EK|UAE|Emirates
EL|ANK|Air Nippon
EM|AEB|Aero Benin
EN|DLA|Air Dolomiti
EO|LHN|Express One International
EP|IRC|Iran Aseman Airlines
EQ|TAE|TAME
ER|RWW|Fly Europa
ES|EUV|EuropeSky
ET|ETH|Ethiopian
EU|EEA|Empresa Ecuatoriana De Aviacion
EV|ASQ|Atlantic Southeast Airlines
EW|EWG|Eurowings
EX|EU9|Europe Jet
EY|ETD|Etihad
EZ|EIA|Evergreen International Airlines
F1|FBL|Fly Brasil
F2|FLM|Fly Air
F3|FSW|Faso Airways
F4|NBK|Albarka Air
F5|FI5|Fly One
F6|RCK|Faroejet
F7|BBO|Flybaboo
F9|FFT|Frontier
FA|SFR|FlySafair
FB|LZB|Bulgaria Air
FC|WBA|Finncomm Airlines
FD|AIQ|Thai AirAsia
FE|WCP|Primaris Airlines
FF|FRF|Fly France
FG|AFG|Ariana Afghan Airlines
FH|FHI|FlyHigh Airlines Ireland (FH)
FI|ICE|Icelandair
FJ|FJI|Air Pacific
FK|WTA|Africa West
FL|TRS|AirTran Airways
FM|CSH|Shanghai Airlines
FO|ATM|Airlines Of Tasmania
FP|FRE|Freedom Air
FQ|TCW|Thomas Cook Airlines
FR|RYR|Ryanair
FS|STU|Servicios de Transportes A
FT|SRH|Siem Reap Airways
FU|FXX|Felix Airways
FV|SDM|Rossiya
FW|IBX|Ibex Airlines
FX|FOX|FOX Linhas Aereas
FY|FFM|Firefly
FZ|FDB|flydubai
G0|GHB|Ghana International Airlines
G1|IG1|Indya Airline Group
G2|VXG|Avirex
G3|GLO|GOL
G4|AAY|Allegiant Air
G6|BSR|Guine Bissaur Airlines
G7|GJS|GoJet Airlines
G8|GOW|Go Air
G9|ABY|Air Arabia
GA|GIA|Garuda
GB|BZE|BRAZIL AIR
GC|GNR|Gambia International Airlines
GD|AHA|Air Alpha Greenland
GE|TNA|TransAsia Airways
GF|GFA|Gulf Air
GG|GUY|Air Guyane
GH|GLP|Globus
GI|IKA|Itek Air
GJ|EEU|Eurofly Service
GL|GRL|Air Greenland
GM|GER|German International Air Lines
GN|AGN|Air Gabon
GO|KZU|Kuzu Airlines Cargo
GP|GDR|Gadair European Airlines
GQ|SEH|Sky Express
GR|AUR|Aurigny Air Services
GS|UPA|Air Foyle
GT|GBL|GB Airways
GU|GU1|Gulisano airways
GV|ARF|Aero Flight
GW|KIL|Kuban Airlines
GX|GXG|GermanXL
GY|GBK|Gabon Airlines
GZ|RAR|Air Rarotonga
H1|HA1|Hankook Air US
H2|SKU|Sky Airline
H3|T33|THREE
H4|IIN|Inter Islands Airlines
H5|RSY|I-Fly
H6|HAG|Hageland Aviation Services
H8|KHB|Dalavia
H9|HAD|Air D'Ayiti
HA|HAL|Hawaiian
HB|HAR|Harbor Airlines
HC|HYM|Himalayan Airlines
HD|ADO|Hokkaido International Airlines
HE|LGW|Luftfahrtgesellschaft Walter
HF|HLF|Hapagfly
HG|NLY|Niki
HH|AHO|Air Hamburg (AHO)
HJ|AXF|Asian Express Airlines
HK|FSC|Four Star Aviation / Four Star Cargo
HM|SEY|Air Seychelles
HN|HNX|Hankook Airline
HO|DKH|Juneyao Airlines
HP|AWE|America West Airlines
HQ|HMY|Harmony Airways
HR|CUA|China United Airlines
HT|IMP|Hellenic Imperial Airways
HU|CHH|Hainan
HV|TRA|Transavia
HW|FHE|Hello
HX|CRK|Hong Kong Airlines
HY|UZB|Uzbekistan Airways
HZ|SOZ|Sat Airlines
I2|IBS|Iberia Express
I4|FWA|Interstate Airline
I5|IDS|Indonesia Sky
I6|MXI|MexicanaLink
I7|PMW|Paramount Airways
I9|AEY|Air Italy
IA|IAW|Iraqi Airways
IB|IBE|Iberia
IC|IAC|Indian Airlines
ID|ITK|Interlink Airlines
IE|SOL|Solomon Airlines
IF|ISW|Islas Airways
IG|ISS|Air Italy
II|UWW|LSM International
IJ|SJO|Spring Airlines Japan
IK|ITX|Imair Airlines
IL|ILW|Illinois Airways
IM|MNJ|Menajet
IN|MAK|MAT Macedonian Airlines
IO|IAA|Indonesian Airlines
IP|ISX|Island Spirit
IQ|AUB|Augsburg Airways
IR|IRA|Iran Air
IT|KFR|Kingfisher Airlines
IV|JET|Wind Jet
IW|WON|Wings Air
IX|AXB|Air India Express
IY|IYE|Yemenia
IZ|AIZ|Arkia Israel Airlines
J2|AHY|Azerbaijan
J3|PLR|Northwestern Air
J4|BFL|Buffalo Airways
J6|AOC|AVCOM
J7|CVC|Centre-Avia
J8|BVT|Berjaya Air
J9|JZR|Jazeera Airways
JA|BON|Air Bosna
JB|JBA|Helijet
JC|JEX|JAL Express
JD|JAS|Japan Air System
JE|MNO|Mango
JF|JAF|Jetairfly
JH|NES|Nordeste Linhas Aereas Regionais
JI|MDW|Midway Airlines
JJ|TAM|TAM Brazilian Airlines
JK|JKK|Spanair
JL|JAL|Japan Airlines
JM|AJM|Air Jamaica
JN|XLA|Excel Airways
JO|JAZ|JALways
JP|ADR|Adria Airways
JQ|JST|Jetstar
JR|JOY|Joy Air
JS|KOR|Air Koryo
JT|LNI|Lion Mentari Airlines
JU|ASL|Air Serbia
JV|BLS|Bearskin Lake Air Service
JW|APW|Arrow Air
JX|JSR|Jusur airways
JY|AXZ|Aereonautica militare
JZ|SKX|Skyways Express
K1|KOQ|Kostromskie avialinii
K2|ELO|Eurolot
K4|CKS|Kalitta Air
K5|SQH|SeaPort Airlines
K6|BRV|Bravo Air Congo
K7|KBR|KoralBlue Airlines
K8|ZAK|Airlink Zambia
K9|KRI|Krylo Airlines
KA|HDA|Dragonair
KB|DRK|Druk Air
KC|KZR|Air Astana
KD|KNI|KD Avia
KE|KAL|Korean Air
KF|BLF|Blue1
KG|RAW|Royal Airways
KH|KHK|Kharkiv Airlines
KI|DHI|Adam Air
KJ|LAJ|British Mediterranean Airways
KK|KKK|AtlasGlobal
KL|KLM|KLM
KM|AMC|Air Malta
KO|AER|Alaska Central Express
KP|DWA|Dense Airways
KQ|KQA|Kenya Airways
KR|CWK|Comores Airlines
KS|PEN|Peninsula Airways
KT|VKJ|VickJet
KU|KAC|Kuwait Airways
KV|MVD|Kavminvodyavia
KX|CAY|Cayman Airways
KY|KSY|KSY
KZ|DC2|Dense Connection
L1|AL1|All Argentina
L2|LYC|Lynden Air Cargo
L3|LTO|LTU Austria
L4|LJJ|Luchsh Airlines
L5|LTR|Lufttransport
L6|MAI|Mauritania Airlines International
L7|LPN|Laoag International Airlines
L8|LBL|Line Blue
L9|AL3|All Asia
LA|LAN|LATAM
LB|LLB|Lloyd Aereo Boliviano
LC|VLO|Varig Log
LD|AHK|Air Hong Kong
LE|LTY|Liberty Airways
LF|NDC|FlyNordic
LG|LGL|Luxair
LH|DLH|Lufthansa
LI|LIA|Leeward Islands Air Transport
LJ|JNA|Jin Air
LK|LXR|Air Luxor
LL|GRO|Allegro
LM|LAM|Linhas A
LN|LAA|Libyan Arab Airlines
LO|LOT|LOT Polish
LP|LPE|LAN Peru
LQ|LMM|LCM AIRLINES
LR|LRC|LACSA
LS|EXS|Jet2.com
LT|LTU|Air Lituanica
LU|LXP|LAN Express
LV|LBC|Albanian Airlines
LW|NMI|Pacific Wings
LX|SWR|SWISS
LY|ELY|El Al
M0|MNG|Aero Mongolia
M1|M1F|Maryland Air
M2|MZS|Mahfooz Aviation
M3|TUS|ABSA - Aerolinhas Brasileiras
M4|1QA|Marysya Airlines
M5|KEN|Kenmore Air
M6|AJT|Amerijet International
M7|MAA|MasAir
M8|TNU|TransNusa Air
M9|MSI|Motor Sich
MA|MAH|Malév
MB|MNB|MNG Airlines
MC|RCH|Air Mobility Command
MD|MDG|Air Madagascar
ME|MEA|Middle East Airlines
MF|CXA|XiamenAir
MG|CCP|Champion Air
MH|MAS|Malaysia Airlines
MI|SLK|SilkAir
MJ|LPR|L
MK|MAU|Air Mauritius
ML|MAV|Maldivo Airlines
MN|CAW|Kulula
MO|AUH|Abu Dhabi Amiri Flight
MP|MPH|Martinair
MQ|EGF|American Eagle Airlines
MR|OME|Homer Air
MS|MSR|EgyptAir
MT|TCX|Thomas Cook Airlines
MU|CES|China Eastern
MV|RML|Armenian International Airways
MW|MYD|Maya Island Air
MX|MXA|Mexicana de Aviaci
MY|MWA|Midwest Airlines (Egypt)
MZ|MNA|Merpati Nusantara Airlines
N2|DAG|Dagestan Airlines
N3|OMS|Omskavia Airline
N4|NWS|Nordwind
N5|SGY|Skagway Air Service
N6|JEV|Lagun Air
N7|N77|All Spain
N8|NCR|National Air Cargo
N9|N99|All Europe
NA|NAL|National Airlines
NB|SNB|Sterling Airlines
NC|NJS|National Jet Systems
NE|ESK|SkyEurope
NF|AVN|Air Vanuatu
NG|LDA|Lauda Air
NH|ANA|All Nippon Airways
NI|PGA|Portugalia
NJ|NGB|Nordic Global Airlines
NK|NKS|Spirit
NL|SAI|Shaheen Air International
NM|DRD|Air Madrid
NN|MOV|VIM Airlines
NO|NGT|Neos
NP|NIA|Nile Air
NQ|AJX|Air Japan
NR|JTO|Jettor Airlines
NT|IBB|Binter
NU|JTA|Japan Transocean Air
NV|CRF|Air Central
NW|NWA|Northwest Airlines
NX|AMU|Air Macau
NY|FXI|Air Iceland
NZ|ANZ|Air New Zealand
O1|OAB|Orbit Airlines Azerbaijan
O6|ONE|Oceanair
O7|OZJ|Ozjet Airlines
O8|OHK|Oasis Hong Kong Airlines
OA|OAL|Olympic
OB|ASZ|Astrakhan Airlines
OD|MXD|Malindo Air
OE|AOT|Asia Overnight Express
OF|FIF|Air Finland
OH|COM|Comair
OI|ORC|Orchid Airlines
OJ|OLA|Overland Airways
OK|CSA|Czech Airlines
OL|OLT|Ostfriesische Lufttransport
OM|MGL|MIAT Mongolian Airlines
ON|RON|Nauru Air Corporation
OO|SKW|SkyWest
OP|PPL|Air Pegasus
OQ|CQN|Chongqing Airlines
OR|TFL|Arkefly
OS|AUA|Austrian
OT|PEL|Aeropelican Air Services
OU|CTN|Croatia
OV|ELL|Estonian Air
OW|EXK|Executive Airlines
OX|OEA|Orient Thai Airlines
OY|OAE|Omni Air International
OZ|AAR|Asiana
P5|RPB|AeroRep
P7|REP|Regional Paraguaya
P8|MKG|Air Mekong
P9|PGP|Perm Airlines
PA|IPV|Parmiss Airlines (IPV)
PC|PGT|Pegasus
PD|POE|Porter Airlines
PE|PEV|Peoples
PF|PNW|Palestinian Airlines
PG|BKP|Bangkok Airways
PH|PAO|Polynesian Airlines
PI|PDT|Piedmont Airlines (1948-1989)
PJ|SPM|Air Saint Pierre
PK|PIA|Pakistan International Airlines
PL|PLI|Aeroper
PM|TOS|Tropic Air
PN|CHB|West Air China
PO|FPT|FlyPortugal
PP|AI0|Air Indus
PQ|LOO|LSM Airlines
PR|PAL|Philippine Airlines
PS|AUI|Ukraine Intl
PT|CCI|Capital Cargo International Airlines
PU|PUA|PLUNA
PV|PNR|PAN Air
PW|PRF|Precision Air
PX|ANG|Air Niugini
PY|SLM|Surinam Airways
PZ|LAP|TAM Mercosur
Q3|QER|SOCHI AIR CHATER
Q4|SAE|SOCHI AIR EXPRESS
Q5|MLA|40-Mile Air
Q6|CDP|Aero Condor Peru
Q8|PEC|Pacific East Asia Cargo Airlines
Q9|NAK|Arik Niger
QB|GFG|Georgian National Airlines
QC|CRD|Air Corridor
QD|DOB|Dobrolet
QE|ECC|Crossair Europe
QF|QFA|Qantas
QH|FLZ|Air Florida
QI|CIM|Cimber Air
QK|JZA|Air Canada Jazz
QL|RLN|Aero Lanka
QM|AML|Air Malawi
QN|ARR|Air Armenia
QO|OGN|Origin Pacific Airways
QP|AKJ|Akasa Air
QQ|UTY|Alliance Airlines
QR|QTR|Qatar Airways
QS|TVS|Travel Service
QT|TPA|TAMPA
QU|UGX|East African
QV|LAO|Lao Airlines
QW|BWG|Blue Wings
QX|QXE|Horizon Air
QY|BCS|European Air Transport
QZ|AWQ|Indonesia AirAsia
R0|RPK|Royal Airlines
R1|RS1|Royal Southern Airlines.
R2|ORB|Orenburg Airlines
R3|SYL|Aircompany Yakutia
R5|MAC|Malta Air Charter
R7|OCA|Aserca Airlines
R8|RRJ|AirRussia
R9|CAM|Camai Air
RA|RNA|Nepal Airlines
RB|SYR|Syrian Arab Airlines
RC|FLI|Atlantic Airways
RD|RYN|Ryan International Airlines
RE|REA|Aer Arann
RF|FWL|Florida West International Airways
RG|VRN|VRG Linhas Aereas
RH|RPH|Republic Express Airlines
RI|MDL|Mandala Airlines
RJ|RJA|Royal Jordanian
RK|RKA|Air Afrique
RL|RFJ|Royal Falcon
RM|RNY|Rainbow Air US
RN|RAB|Rainbow Air (RAI)
RO|ROT|TAROM
RP|CHQ|Chautauqua Airlines
RQ|KMF|Kam Air
RR|RXR|REXAIR VIRTUEL
RS|SKV|Sky Regional
RU|RUE|Rainbow Air Euro
RV|CPN|Caspian Airlines
RW|RPA|Republic Airlines
RX|RPO|Rainbow Air Polynesia
RY|RAY|Rainbow Air Canada
S0|SAL|Spike Airlines
S1|SA1|Serbian Airlines
S2|RSH|Air Sahara
S3|BBR|Santa Barbara Airlines
S4|RZO|Azores
S5|TCF|Shuttle America
S7|SBI|S7 Airlines
S8|SBD|Snowbird Airlines
S9|HSA|East African Safari Air
SA|SAA|South African
SB|ACI|Air Caledonie International
SC|CDG|Shandong Airlines
SD|SUD|Sudan Airways
SE|SEU|XL Airways France
SF|DTH|Tassili Airlines
SG|SEJ|SpiceJet
SH|SHA|Sharp Airlines
SI|SIH|Skynet Airlines
SJ|SJY|Sriwijaya Air
SK|SAS|SAS
SL|RSL|Rio Sul Servi
SM|MNP|Spirit of Manila Airlines
SN|BEL|Brussels Airlines
SO|SLC|Salsa d\\\\'Haiti
SP|SAT|SATA Air Acores
SQ|SIA|Singapore Airlines
SR|SWR|Swissair
SS|CRL|Corsairfly
ST|GMI|Germania
SU|AFL|Aeroflot
SV|SVA|Saudia
SW|NMB|Air Namibia
SX|SRK|Sky Work Airlines
SY|SCX|Sun Country Airlines
T1|TP3|TROPICAL LINHAS AEREAS
T2|TCG|Thai Air Cargo
T3|EZE|Eastern Airways
T4|HEJ|Hellas Jet
T5|TUA|Turkmenistan Airlines
T6|TP6|Trans Pas Air
T7|TJT|Twin Jet
T9|TRZ|TransMeridian Airlines
TA|TAT|Grupo TACA
TB|TBZ|TrasBrasil
TC|ATC|Air Tanzania
TD|LUR|Atlantis European Airways
TE|LIL|FlyLal
TF|SCW|Malmö Aviation
TG|THA|Thai Airways
TH|THS|TransBrasil Airlines
TI|THI|TransHolding
TJ|TJA|T.J. Air
TK|THY|Turkish Airlines
TL|ANO|Airnorth
TN|THT|Air Tahiti Nui
TO|TVF|Transavia France
TP|TAP|TAP Air Portugal
TQ|TXW|Texas Wings
TR|TGW|Scoot
TS|TSC|Air Transat
TT|TGW|Tiger Airways Australia
TU|TAR|Tunisair
TV|VEX|Virgin Express
TW|TWB|Tway Airlines
TX|FWI|Air Caraïbes
TY|IWD|Iberworld
TZ|SCO|Scoot
U1|ABI|Aviabus
U2|EZY|easyJet
U3|AIA|Avies
U4|PMT|PMTair
U5|GWY|USA3000 Airlines
U6|SVR|Ural
U7|JUS|USA Jet Airlines
U8|RNV|Armavia
U9|TAK|Tatarstan Airlines
UA|UAL|United Airlines
UB|UBA|Myanma Airways
UD|HER|Hex'Air
UE|NAS|Nasair
UF|UKM|UM Airlines
UG|TUX|TunisAir Express
UI|ECA|Eurocypria Airlines
UJ|LMU|AlMasria Universal Airlines
UK|VTI|Akasa/Vistara
UL|ALK|SriLankan Airlines
UM|AZW|Air Zimbabwe
UN|TSO|Transaero Airlines
UO|HKE|HK Express
UP|BHS|Bahamasair
UQ|SJU|Skyjet Airlines
US|USA|US Airways
UT|UTA|UTair
UU|REU|Air Austral
UX|AEA|Air Europa
UY|UYC|Cameroon Airlines
UZ|BRQ|El-Buraq Air Transport
V0|VCV|Conviasa
V1|VIA|VIA Líneas Aéreas
V2|RBY|Vision Airlines (V2)
V3|KRP|Carpatair
V4|REK|Reem Air
V5|VLI|Avolar Aerolineas
V7|VOE|Volotea
V8|VAS|ATRAN Cargo Airlines
V9|HCW|Star1 Airlines
VA|VOZ|Virgin Australia
VC|VCX|Ocean Airlines
VD|KPA|Kunpeng Airlines
VE|VLE|Volare Airlines
VF|VLE|AJet
VG|VLM|VLM Airlines
VH|VNP|Virgin Pacific
VI|VDA|Volga-Dnepr Airlines
VJ|RAC|Royal Air Cambodge
VK|VGN|Virgin Nigeria Airways
VL|VIM|Air VIA
VM|VOA|Viaggio Air
VN|HVN|Vietnam Airlines
VO|TYR|Tyrolean Airways
VP|VSP|VASP
VQ|VKH|Viking Hellas
VR|TCV|TACV
VS|VIR|Virgin Atlantic
VT|VTA|Air Tahiti
VU|VUN|Air Ivoire
VV|AEW|Aerosvit Airlines
VW|TAO|Aeromar
VX|VRD|Virgin America
VY|VLG|Vueling
VZ|MYT|MyTravel Airways
W1|WE1|World Experience Airline
W2|CWA|Canadian Western Airlines
W3|WSS|World Scale Airlines
W4|WMT|Wizz Malta
W5|IRM|Mahan Air
W6|WZZ|Wizz Air
W8|CJT|Cargojet Airways
W9|WUK|Wizz UK
WA|KLC|KLM Cityhopper
WB|RWD|Rwandair Express
WC|ISV|Islena De Inversiones
WD|AAN|Amsterdam Airlines
WE|CWC|Centurion Air Cargo
WF|WIF|Widerøe
WG|SWG|Sunwing Airlines
WH|CNW|China Northwest Airlines
WJ|WEB|WebJet Linhas A
WK|EDW|Edelweiss Air
WL|FQR|CheapFlyingInternational
WN|SWA|Southwest
WO|WOA|World Airways
WP|MKU|Island Air (WP)
WQ|PQW|PanAm World Airways
WR|WEN|WestJet Encore
WS|WJA|WestJet
WU|WAU|Wizz Air Ukraine
WV|SWV|Swe Fly
WW|BMI|bmibaby
WX|BCY|CityJet
WY|OMA|Oman Air
WZ|RWZ|Red Wings
X3|TUI|TUI fly
X5|OTJ|Fly Romania
X7|CHF|Chitaavia
X9|X9F|FRA Air
XA|XAU|XAIR USA
XB|NXB|NEXT Brasil
XE|BTA|ExpressJet
XF|VLK|Vladivostok Air
XG|CLI|Calima Aviacion
XJ|MES|Mesaba Airlines
XK|CCM|Corse-Mediterranee
XL|LNE|Aerolane
XM|SMX|Alitalia Express
XO|LTE|LTE International Airways
XP|XPT|XPTO
XQ|SXS|SunExpress
XS|SIT|SITA
XT|AXL|Air Exel
XW|SXR|Sky Express
XX|GFY|Greenfly
XY|KNE|Nas Air
Y4|VOI|Volaris
Y5|AWA|Asia Wings
Y8|MRS|Marusya Airways
Y9|IRK|Kish Air
YC|YCC|Ciel Canadien
YE|YEL|Yellowtail
YL|LLM|Yamal Airlines
YM|MGX|Montenegro Airlines
YO|TYS|TransHolding System
YP|AEF|Aero Lloyd (YP)
YS|RAE|Régional
YT|TGA|Air Togo
YV|ASH|Mesa Airlines
YW|ANE|Air Nostrum
YX|MEP|Midwest Airlines
YY|VWA|Virginwings
YZ|YZZ|LSM AIRLINES
Z0|Z9H|All Argentina Express
Z3|SMJ|Avient Aviation
Z4|OOM|Zoom Airlines
Z5|IIR|INAVIA Internacional
Z6|ZTT|ZABAIKAL AIRLINES
Z7|ADK|ADC Airlines
Z8|AZN|Amaszonas
ZA|CYD|Access Air
ZB|EFW|Air Albania
ZC|KGO|Korongo Airlines
ZE|ESR|Eastar Jet
ZF|AZV|Azur Air
ZG|VVM|Viva Macau
ZH|CSZ|Shenzhen
ZI|AAF|Aigle Azur
ZK|GLA|Great Lakes Airlines
ZL|RXA|Regional Express
ZM|IWA|Apache Air
ZN|ZNA|Zenith International Airline
ZP|ZZZ|Zabaykalskii Airlines
ZQ|LOC|Locair
ZS|SMY|Sama Airlines
ZT|AWC|Titan
ZU|HCY|Helios Airways
ZV|VAX|V Air
ZW|AWI|Air Wisconsin
ZX|ZXY|Japan Regio
ZY|ADE|Ada Air
\\N|TYR|Tyrolean Airways`;
