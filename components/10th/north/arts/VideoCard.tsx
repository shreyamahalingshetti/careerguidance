import Image from "next/image";

export function VideoCard(props: any) {
  return (
    <a
      className="block p-3"
      href={props.link}
      target="_blank"
      rel="noreferrer"
    >
      <Image
        src={props.image}
        alt={props.title}
        width={400}
        height={200}
        className="rounded-xl"
      />
      <div className="pt-2">
        <div className="font-semibold">{props.title}</div>
        {props.link ? <div className="text-gray-400 text-sm">{props.link}</div> : null}
      </div>
    </a>
  );
}