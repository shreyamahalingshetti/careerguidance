import { VideoCard } from "./VideoCard";

const VIDEOS = [
  {
    title: "Jyoti Nivas PU College (Bengaluru)",
    image: "/commerce/jyoti_pu_pu.jpg",
    link:"https://jnpuc.org/"
  },
  {
    title: "MES PU College (Bengaluru)",
    image: "/commerce/mes_pu.jpg",
    link:"https://mesacspuc.in/"
  },
  {
    title: "Mount Carmel PU College (Bengaluru)*",
    image: "/commerce/mount_carmel.jpg",
    link:"https://www.mcpuc.edu.in/"
  },
  {
    title: "National PU College (Bengaluru)",
    image: "/commerce/national_pu.jpg",
    link:"https://www.nationalpujayanagar.edu.in/"   
  },
  {
    title: "Sri Bhagawan Mahaveer Jain PU (Bengaluru)",
    image: "/commerce/shri_bhagawaan_pu.jpg",
    link:"https://www.jaincollege.ac.in/"   
  },
  {
    title: "St. Joseph’s PU College (Bengaluru)",
    image: "/commerce/st_josephs_pu.jpg",
    link:"https://www.sjpuc.in/"   
  },
  {
    title: "Bishop Cotton Women’s Christian PU (Bengaluru)",
    image: "/commerce/bishop_pu.jpg",
    link:"https://bcwclc.com/"
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