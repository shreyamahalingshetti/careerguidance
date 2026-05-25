import { VideoCard } from "./VideoCard";

const VIDEOS = [
  {
    title: "Alva's PU College (Moodbidri / Dakshina Kannada)",
    image: "/science/alvas_pu.jpg",
    link:"https://alvaspucollege.org/"
  },
  {
    title: "Christ Junior College (Bengaluru)",
    image: "/science/christ_pu.jpg",
    link:"https://www.christjuniorcollege.in/"
  },
  {
    title: "Deeksha / RNS / integrated PU colleges (Bengaluru)",
    image: "/science/deeksha_pu.jpg",
    link:"https://www.rnspuc.edu.in/"
  },
  {
    title: "Jain PU College (multiple centres, Bengaluru)",
    image: "/science/jain_pu.jpg",
    link:"https://www.jaincollege.ac.in/"
  },
  {
    title: "MES / Sri Bhagawan Mahaveer Jain PU (Bengaluru)",
    image: "/science/mes_pu.jpg",
    link:"https://mesacspuc.in/"
  },
  {
    title: "Mount Carmel PU College (Bengaluru)",
    image: "/science/mount_carmel.jpg",
    link:"https://www.mcpuc.edu.in/"   
  },
  {
    title: "National PU College (Jayanagar / Bengaluru)",
    image: "/science/national_pu.jpg",
    link:"https://www.nationalpujayanagar.edu.in/"
  },
  {
    title: "St. Aloysius PU College (Mangaluru)",
    image: "/science/st_aloysius.jpg",
    link:"https://www.staloysiuspuc.in/"
  },
  {
    title: "St. Joseph's Pre-University College (Bengaluru)",
    image: "/science/st_josephs.jpg",
    link:"https://www.sjpuc.in/"
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