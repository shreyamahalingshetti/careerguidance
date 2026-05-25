import { VideoCard } from "./VideoCard";

const VIDEOS = [
  {
    title: "Bishop Cotton Women's Christian PU (Bengaluru)",
    image: "/arts/bishop_pu.jpg",
    link:"https://bcwclc.com/"
  },
  {
    title: "Jyoti Nivas PU College (Bengaluru)",
    image: "/arts/jyoti_pu_pu.jpg",
    link:"https://jnpuc.org/"
  },
  {
    title: "Mount Carmel PU College (Bengaluru)",
    image: "/arts/mount_camel.jpg",
    link:"https://www.mcpuc.edu.in/"
  },
  {
    title: "National PU / MES / Jain PU (humanities combinations) (Bengaluru)",
    image: "/arts/national_pu.jpg",
    link:"https://www.nationalpujayanagar.edu.in/"
  },
  {
    title: "St. Aloysius PU College (Bengaluru)",
    image: "/arts/st_aloysius.jpg",
    link:"https://www.staloysiuspuc.in/"   
  },
  {
    title: "St. Joseph's PU College (Bengaluru)",
    image: "/arts/st_josephs_pu.jpg",
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