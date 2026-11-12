/**
 * Kenyan universities shown in the AI254 LIVE student join form.
 *
 * Compiled from the public and private universities and university colleges
 * recognised in Kenya. Institutions are renamed, upgraded and newly chartered
 * from time to time, so check this list against the Commission for University
 * Education (CUE) register (https://www.cue.or.ke) and edit it here as needed.
 * Students whose institution is missing can choose "Other (not listed)".
 */

export const PUBLIC_UNIVERSITIES = [
  "Alupe University",
  "Bomet University College",
  "Chuka University",
  "Co-operative University of Kenya",
  "Dedan Kimathi University of Technology",
  "Egerton University",
  "Garissa University",
  "Jaramogi Oginga Odinga University of Science and Technology",
  "Jomo Kenyatta University of Agriculture and Technology",
  "Kaimosi Friends University",
  "Karatina University",
  "Kenyatta University",
  "Kibabii University",
  "Kirinyaga University",
  "Kisii University",
  "Koitaleel Samoei University College",
  "Laikipia University",
  "Maasai Mara University",
  "Machakos University",
  "Maseno University",
  "Masinde Muliro University of Science and Technology",
  "Meru University of Science and Technology",
  "Moi University",
  "Multimedia University of Kenya",
  "Murang'a University of Technology",
  "National Defence University – Kenya",
  "Open University of Kenya",
  "Pwani University",
  "Rongo University",
  "South Eastern Kenya University",
  "Taita Taveta University",
  "Technical University of Kenya",
  "Technical University of Mombasa",
  "Tharaka University",
  "Tom Mboya University",
  "Turkana University College",
  "University of Eldoret",
  "University of Embu",
  "University of Kabianga",
  "University of Nairobi",
] as const;

export const PRIVATE_UNIVERSITIES = [
  "Adventist University of Africa",
  "Africa International University",
  "Africa Nazarene University",
  "Aga Khan University",
  "Amref International University",
  "Catholic University of Eastern Africa",
  "Daystar University",
  "East African University",
  "Great Lakes University of Kisumu",
  "Gretsa University",
  "Hekima University College",
  "Inoorero University",
  "International Leadership University",
  "KAG East University",
  "Kabarak University",
  "KCA University",
  "Kenya Highlands University",
  "Kenya Methodist University",
  "Kiriri Women's University of Science and Technology",
  "Lukenya University",
  "Management University of Africa",
  "Marist International University College",
  "Mount Kenya University",
  "Pan Africa Christian University",
  "Pioneer International University",
  "Presbyterian University of East Africa",
  "Riara University",
  "Scott Christian University",
  "St. Paul's University",
  "Strathmore University",
  "Tangaza University",
  "Umma University",
  "United States International University – Africa",
  "University of Eastern Africa, Baraton",
  "Uzima University",
  "Zetech University",
] as const;

export const OTHER_UNIVERSITY = "Other (not listed)";

export const ALL_UNIVERSITIES: readonly string[] = [...PUBLIC_UNIVERSITIES, ...PRIVATE_UNIVERSITIES];

export function isKnownUniversity(name: string) {
  return ALL_UNIVERSITIES.includes(name);
}
