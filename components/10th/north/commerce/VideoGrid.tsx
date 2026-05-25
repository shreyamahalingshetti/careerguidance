import { VideoCard } from "./VideoCard";

const VIDEOS = [
  {
    title: "Smt. Vidya P. Hanchinmani PU College,Dharwad",
    image: "/commerce/Hanchinmani PU College Dharwad.jpg",
    link:"https://www.hanchinmanicollege.com/"
  },
  {
    title: "Karnatak Arts & Commerce PU College,",
    image: "/commerce/kacd_pu.jpg",
    link:"https://www.kacd.ac.in/"   
  },
  {
    title: "Basaveshwar Commerce PU College, Bagalkote",
    image: "/commerce/basaveshwar_pu.jpg",
    link:"https://bvvsbccbbgk.org/"
  },
  {
    title: "S.B. Arts & K.C.P. Science & Commerce PU College, Vijayapura (Bijapur)",
    image: "/commerce/sb_pu.jpg",
    link:"https://sbkcppu.ac.in/"
  },
  {
    title: "Shaheen PU College (Commerce), Bidar",
    image: "/commerce/shaheen_pu.jpg",
    link:"https://shaheengroup.org/shaheen-pu-college-gulbarga/"
  },
  {
    title: "Shri Sai PU Science & Commerce College, dharwad",
    image: "/commerce/shri_sai_pu.jpg",
    link:"https://shrisaicollegedharwad.com/"   
  },

   {
    title: "C V RAMAN PU SCIENCE AND COMMERCE COLLEGE, Dharwad",
    image: "/commerce/c_v_raman_pu.jpg",
    link:"https://www.cvramancollegedharwad.com/"   
  },
  {
    title: "KLE Society's G.I. Bagewadi PU College, Belagavi",
    image: "/commerce/bagewadi_pu.jpg",
    link:""   
  },
  {
    title: "Appa PU College (Commerce), Kalaburagi",
    image: "/commerce/appa_pu.jpg",
    link:""   
  },
];

export const VideoGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {VIDEOS.map((video, index) => (
        <div key={index}>
          <VideoCard
            title={video.title}
            image={video.image}
            link={video.link}
          />
        </div>
      ))}
    </div>
  );
};