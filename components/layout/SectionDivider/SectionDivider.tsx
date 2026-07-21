import { BookOpen, GraduationCap, Headphones, MessageCircleQuestion, ScrollText } from "lucide-react";
import styles from "./SectionDivider.module.css";

type SectionDividerProps = {
  variant: "paper" | "audio" | "audioBook" | "book" | "manuscript" | "fatwa";
};

export default function SectionDivider({ variant }: SectionDividerProps) {
  if (variant === "paper") {
    return (
      <div
        className={`${styles.divider} ${styles.paperDivider}`}
        aria-hidden="true"
      >
        <span className={styles.paperGrain} />
        <i className={styles.fragmentOne} />
        <i className={styles.fragmentTwo} />
        <i className={styles.fragmentThree} />
      </div>
    );
  }

  if (variant === "audio") {
    return (
      <div
        className={`${styles.divider} ${styles.audioDivider}`}
        aria-hidden="true"
      >
        <span className={styles.audioWave}>
          {Array.from({ length: 23 }).map((_, index) => (
            <i key={index} />
          ))}
        </span>
      
      </div>
    );
  }

  if (variant === "book") {
    return (
      <div
        className={`${styles.divider} ${styles.bookDivider}`}
        aria-hidden="true"
      >
        <span className={styles.academicLine} />
        <span className={`${styles.academicNode} ${styles.libraryNode}`}>
          <i>
            <BookOpen size={21} strokeWidth={1.6} />
          </i>
          <small>المصنَّفات</small>
        </span>
        <span className={styles.knowledgeFlow}>
          {Array.from({ length: 5 }).map((_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className={styles.academicSeal}>
          <i>
            <ScrollText size={20} strokeWidth={1.5} />
          </i>
        </span>
        <span className={`${styles.knowledgeFlow} ${styles.reverseFlow}`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className={`${styles.academicNode} ${styles.graduationNode}`}>
          <i>
            <GraduationCap size={22} strokeWidth={1.6} />
          </i>
          <small>الرسائل العلمية</small>
        </span>
      </div>
    );
  }

  if (variant === "audioBook") {
    return (
      <div className={`${styles.divider} ${styles.audioBookDivider}`} aria-hidden="true">
        <span className={styles.audioBookPath}>
          <i className={styles.listeningNode}><Headphones size={22} strokeWidth={1.55}/></i>
          <b className={styles.soundTrail}>{Array.from({length:11}).map((_,index)=><i key={index}/>)}</b>
          <i className={styles.audioBookSeal}><Headphones size={23}/><span/><BookOpen size={24}/></i>
          <b className={`${styles.soundTrail} ${styles.reverseSoundTrail}`}>{Array.from({length:11}).map((_,index)=><i key={index}/>)}</b>
          <i className={styles.readingNode}><BookOpen size={22} strokeWidth={1.55}/></i>
        </span>
      </div>
    );
  }

  if (variant === "fatwa") {
    return (
      <div className={`${styles.divider} ${styles.fatwaDivider}`} aria-hidden="true">
        <span className={styles.fatwaJourney}>
          <i className={styles.fatwaNode}><GraduationCap size={21} strokeWidth={1.5}/></i>
          <b className={styles.fatwaFlow}>{Array.from({length:7}).map((_,index)=><i key={index}/>)}</b>
          <i className={styles.fatwaMark}><MessageCircleQuestion size={27} strokeWidth={1.5}/><small>سؤال وجواب</small></i>
          <b className={`${styles.fatwaFlow} ${styles.fatwaFlowReverse}`}>{Array.from({length:7}).map((_,index)=><i key={index}/>)}</b>
          <i className={styles.fatwaNode}><BookOpen size={21} strokeWidth={1.5}/></i>
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.divider} ${styles.manuscriptDivider}`}
      aria-hidden="true"
    >
      <span className={styles.inkLine} />
      <span className={styles.inkSeal}>۞</span>
      <span className={styles.inkLine} />
    </div>
  );
}
