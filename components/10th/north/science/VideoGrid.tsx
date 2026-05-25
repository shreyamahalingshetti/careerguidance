import { VideoCard } from "./VideoCard";

const VIDEOS = [
  {
    title: "Empower PU College Dharwad",
    image: "/science/empower_pu.jpg",
    link:"https://www.empowerpucollege.com/"
  },
  {
    title: "Smt. Vidya P. Hanchinmani PU Science College Dharwad",
    image: "/science/Hanchinmani PU College Dharwad.jpg",
    link:"https://www.hanchinmanicollege.com/"   
  },
  {
    title: "Jnanaamrutha pu college, ballari",
    image: "/science/jnanaamrutha_pu.jpg",
    link:"https://jnanaamrutha.in/"   
  },
   {
    title: "Vidyaniketan PU Science College, Hubli",
    image: "/science/vidyaniketan.jpg",
    link:"https://vidyaniketanpusciencecollegehubli.in/Default.aspx"   
  },
   {
    title: "SWAMI VIVEKANANDA PU SCIENCE COLLEGE, Dharwad",
    image: "/science/vivekananda_pu.jpg",
    link:"https://svvsbilagi.in/"   
  },
   {
    title: "KLE Prerana PU College, BVB Campus, Hubballi",
    image: "/science/prerana.jpg",
    link:""   
  },
   {
    title: "Spandana Pre University College, Ilkal",
    image: "/science/spandana_pu.jpg",
    link:""   
  },
   {
    title: "Prism PU Science College- Timmanagoudar Education Academy, Dharwad",
    image: "/science/prism_pu.jpg",
    link:""   
  },
  {
    title: "Chetan & Sachetan Pre-University Science Colleges, Hubballi",
    image: "/science/chetan_pu.jpg",
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