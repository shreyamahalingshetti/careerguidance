import { VideoCard } from "./VideoCard";

const VIDEOS = [
  {
    title: "Basaveshwar Arts College, Bagalkote",
    image: "arts/basaveshwar_pu.jpg",
    link:"https://bvvsbacb.org/"
  },
  {
    title: "Karnatak Arts College, Dharwad",
    image: "arts/kacd_pu.jpg",
    link:"https://www.kacd.ac.in/"
  },
  {
    title: "Karnatak Arts, Science & Commerce College (KASCC), Bidar",
    image: "arts/karnataka_arts_pu.jpg",
    link:"https://www.kascc.in.net/"
  },
  {
    title: "Kittel Arts College, Dharwad",
    image: "arts/kittel_pu.jpg",
    link:"https://www.kittelartscollege.ac.in/"
  },
  {
    title: "M.G.V.C. Arts, Commerce & Science College, Muddebihal",
    image: "arts/mgvc_pu.jpg",
    link:"https://www.mgvcmbl.in/"
  },
  {
    title: "Nehru Arts, Science & Commerce College, Hubballi",
    image: "arts/nehru_pu.jpg",
    link:"https://nehrucollegehubli.edu.in/"
  },
  {
    title: "S.V.M. Arts, Science & Commerce College, Ilkal",
    image: "arts/svm_pu.jpg",
    link:"https://svmdegreecollege.edu.in/"
  },
  {
    title: "JSS Banashankari Arts, Commerce & S.K. Gubbi Science College, Dharwad",
    image: "arts/jss_pu.jpg",
    link:""
  },
  {
    title: "M.M.K. College of Visual Arts, Kalaburagi",
    image: "arts/mmk_pu.jpg",
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