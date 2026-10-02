import { db, storage } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  increment,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const LOCAL_COMMUNITY_KEY = 'music_app_local_community_cache_v2';

// Pre-populated Official YouTube Music Playlists & Hit Tracks for Top Artists
export const DEFAULT_ARTIST_PLAYLISTS = [
  {
    id: "yt-pl-arijit-singh-hits",
    name: "Best of Arijit Singh - Ultimate All Hits",
    author: "Arijit Singh Official",
    source: "youtube",
    genre: "Hindi",
    artwork: "https://img.youtube.com/vi/BddP6PYo2gs/hqdefault.jpg",
    originalUrl: "https://music.youtube.com/channel/UC56gTxNs4f9xZ7Pa2i5xNzg",
    trackCount: 9,
    likes: 342,
    views: 1890,
    tracks: [
      {
        id: "yt-BddP6PYo2gs",
        title: "Kesariya (Brahmāstra)",
        artist: "Arijit Singh, Pritam",
        artwork: "https://img.youtube.com/vi/BddP6PYo2gs/hqdefault.jpg",
        duration: 268,
        source: "youtube",
        youtubeId: "BddP6PYo2gs",
        genre: "Hindi",
        streamUrl: "https://www.youtube.com/watch?v=BddP6PYo2gs",
        likes: 125,
        playCount: 450
      },
      {
        id: "yt-IJq0ydzLk-s",
        title: "Tum Hi Ho (Aashiqui 2)",
        artist: "Arijit Singh, Mithoon",
        artwork: "https://img.youtube.com/vi/IJq0ydzLk-s/hqdefault.jpg",
        duration: 262,
        source: "youtube",
        youtubeId: "IJq0ydzLk-s",
        genre: "Hindi",
        streamUrl: "https://www.youtube.com/watch?v=IJq0ydzLk-s",
        likes: 98,
        playCount: 380
      },
      {
        id: "yt-ElZfdU54Cp8",
        title: "Apna Bana Le (Bhediya)",
        artist: "Arijit Singh, Sachin-Jigar",
        artwork: "https://img.youtube.com/vi/ElZfdU54Cp8/hqdefault.jpg",
        duration: 261,
        source: "youtube",
        youtubeId: "ElZfdU54Cp8",
        genre: "Hindi",
        streamUrl: "https://www.youtube.com/watch?v=ElZfdU54Cp8",
        likes: 85,
        playCount: 310
      },
      {
        id: "yt-284Ov7ysmfA",
        title: "Channa Mereya (Ae Dil Hai Mushkil)",
        artist: "Arijit Singh, Pritam",
        artwork: "https://img.youtube.com/vi/284Ov7ysmfA/hqdefault.jpg",
        duration: 289,
        source: "youtube",
        youtubeId: "284Ov7ysmfA",
        genre: "Hindi",
        streamUrl: "https://www.youtube.com/watch?v=284Ov7ysmfA",
        likes: 110,
        playCount: 420
      },
      {
        id: "yt-VAdGW7QDJUI",
        title: "Chaleya (Jawan)",
        artist: "Arijit Singh, Shilpa Rao, Anirudh",
        artwork: "https://img.youtube.com/vi/VAdGW7QDJUI/hqdefault.jpg",
        duration: 200,
        source: "youtube",
        youtubeId: "VAdGW7QDJUI",
        genre: "Hindi",
        streamUrl: "https://www.youtube.com/watch?v=VAdGW7QDJUI",
        likes: 145,
        playCount: 520
      },
      {
        id: "yt-sK7riqg2mr4",
        title: "Agar Tum Saath Ho (Tamasha)",
        artist: "Arijit Singh, Alka Yagnik, A.R. Rahman",
        artwork: "https://img.youtube.com/vi/sK7riqg2mr4/hqdefault.jpg",
        duration: 341,
        source: "youtube",
        youtubeId: "sK7riqg2mr4",
        genre: "Hindi",
        streamUrl: "https://www.youtube.com/watch?v=sK7riqg2mr4",
        likes: 190,
        playCount: 610
      },
      {
        id: "yt-8sLS2knUa6Y",
        title: "O Maahi (Dunki)",
        artist: "Arijit Singh, Pritam",
        artwork: "https://img.youtube.com/vi/8sLS2knUa6Y/hqdefault.jpg",
        duration: 233,
        source: "youtube",
        youtubeId: "8sLS2knUa6Y",
        genre: "Hindi",
        streamUrl: "https://www.youtube.com/watch?v=8sLS2knUa6Y",
        likes: 76,
        playCount: 290
      },
      {
        id: "yt-RLzC55aiAoQ",
        title: "Heeriye",
        artist: "Arijit Singh, Jasleen Royal",
        artwork: "https://img.youtube.com/vi/RLzC55aiAoQ/hqdefault.jpg",
        duration: 195,
        source: "youtube",
        youtubeId: "RLzC55aiAoQ",
        genre: "Hindi",
        streamUrl: "https://www.youtube.com/watch?v=RLzC55aiAoQ",
        likes: 89,
        playCount: 340
      },
      {
        id: "yt-CA_e37v9Jd0",
        title: "Shayad (Love Aaj Kal)",
        artist: "Arijit Singh, Pritam",
        artwork: "https://img.youtube.com/vi/CA_e37v9Jd0/hqdefault.jpg",
        duration: 247,
        source: "youtube",
        youtubeId: "CA_e37v9Jd0",
        genre: "Hindi",
        streamUrl: "https://www.youtube.com/watch?v=CA_e37v9Jd0",
        likes: 67,
        playCount: 260
      }
    ]
  },
  {
    id: "yt-pl-sidhu-moose-wala-legend",
    name: "Sidhu Moose Wala - The Immortal Legend",
    author: "Sidhu Moose Wala Official",
    source: "youtube",
    genre: "Punjabi",
    artwork: "https://img.youtube.com/vi/n_FCrCQ6-bY/hqdefault.jpg",
    originalUrl: "https://music.youtube.com/channel/UC-N11hY-03wN93544y150hQ",
    trackCount: 7,
    likes: 420,
    views: 2450,
    tracks: [
      {
        id: "yt-n_FCrCQ6-bY",
        title: "295 (Moosetape)",
        artist: "Sidhu Moose Wala",
        artwork: "https://img.youtube.com/vi/n_FCrCQ6-bY/hqdefault.jpg",
        duration: 270,
        source: "youtube",
        youtubeId: "n_FCrCQ6-bY",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=n_FCrCQ6-bY",
        likes: 310,
        playCount: 950
      },
      {
        id: "yt-6x7qO3y1wY8",
        title: "The Last Ride",
        artist: "Sidhu Moose Wala, Wazir Patar",
        artwork: "https://img.youtube.com/vi/6x7qO3y1wY8/hqdefault.jpg",
        duration: 260,
        source: "youtube",
        youtubeId: "6x7qO3y1wY8",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=6x7qO3y1wY8",
        likes: 275,
        playCount: 820
      },
      {
        id: "yt-cl0a3i2wF_Y",
        title: "So High",
        artist: "Sidhu Moose Wala, BYG BYRD",
        artwork: "https://img.youtube.com/vi/cl0a3i2wF_Y/hqdefault.jpg",
        duration: 235,
        source: "youtube",
        youtubeId: "cl0a3i2wF_Y",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=cl0a3i2wF_Y",
        likes: 290,
        playCount: 880
      },
      {
        id: "yt-3w1jQ8x0y_c",
        title: "Levels",
        artist: "Sidhu Moose Wala, Sunny Malton",
        artwork: "https://img.youtube.com/vi/3w1jQ8x0y_c/hqdefault.jpg",
        duration: 232,
        source: "youtube",
        youtubeId: "3w1jQ8x0y_c",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=3w1jQ8x0y_c",
        likes: 180,
        playCount: 540
      },
      {
        id: "yt-F_b8Bw0x8yA",
        title: "Old Skool",
        artist: "Prem Dhillon, Sidhu Moose Wala",
        artwork: "https://img.youtube.com/vi/F_b8Bw0x8yA/hqdefault.jpg",
        duration: 254,
        source: "youtube",
        youtubeId: "F_b8Bw0x8yA",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=F_b8Bw0x8yA",
        likes: 195,
        playCount: 620
      },
      {
        id: "yt-j13Y_08b_0A",
        title: "Same Beef",
        artist: "Sidhu Moose Wala, Bohemia",
        artwork: "https://img.youtube.com/vi/j13Y_08b_0A/hqdefault.jpg",
        duration: 280,
        source: "youtube",
        youtubeId: "j13Y_08b_0A",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=j13Y_08b_0A",
        likes: 210,
        playCount: 670
      },
      {
        id: "yt-1jK_0x_8bA8",
        title: "Dollar (Dakuaan Da Munda)",
        artist: "Sidhu Moose Wala",
        artwork: "https://img.youtube.com/vi/1jK_0x_8bA8/hqdefault.jpg",
        duration: 215,
        source: "youtube",
        youtubeId: "1jK_0x_8bA8",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=1jK_0x_8bA8",
        likes: 160,
        playCount: 490
      }
    ]
  },
  {
    id: "yt-pl-diljit-dosanjh-goat",
    name: "Diljit Dosanjh - Global Punjabi Star",
    author: "Diljit Dosanjh Official",
    source: "youtube",
    genre: "Punjabi",
    artwork: "https://img.youtube.com/vi/f4b8_bA808A/hqdefault.jpg",
    originalUrl: "https://music.youtube.com/channel/UCq8j9X1yX2r8-Psm9C13Tkw",
    trackCount: 6,
    likes: 280,
    views: 1650,
    tracks: [
      {
        id: "yt-f4b8_bA808A",
        title: "Lover (MoonChild Era)",
        artist: "Diljit Dosanjh, Intense",
        artwork: "https://img.youtube.com/vi/f4b8_bA808A/hqdefault.jpg",
        duration: 210,
        source: "youtube",
        youtubeId: "f4b8_bA808A",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=f4b8_bA808A",
        likes: 240,
        playCount: 780
      },
      {
        id: "yt-cl0a3i2wF_Y-diljit",
        title: "G.O.A.T. (Title Track)",
        artist: "Diljit Dosanjh",
        artwork: "https://img.youtube.com/vi/cl0a3i2wF_Y/hqdefault.jpg",
        duration: 225,
        source: "youtube",
        youtubeId: "cl0a3i2wF_Y",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=cl0a3i2wF_Y",
        likes: 220,
        playCount: 710
      },
      {
        id: "yt-3w1jQ8x0y_c-diljit",
        title: "Born to Shine",
        artist: "Diljit Dosanjh",
        artwork: "https://img.youtube.com/vi/3w1jQ8x0y_c/hqdefault.jpg",
        duration: 212,
        source: "youtube",
        youtubeId: "3w1jQ8x0y_c",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=3w1jQ8x0y_c",
        likes: 190,
        playCount: 590
      },
      {
        id: "yt-mevO4I0f5lg-diljit",
        title: "Naina (Crew)",
        artist: "Diljit Dosanjh, Badshah",
        artwork: "https://img.youtube.com/vi/mevO4I0f5lg/hqdefault.jpg",
        duration: 180,
        source: "youtube",
        youtubeId: "mevO4I0f5lg",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=mevO4I0f5lg",
        likes: 175,
        playCount: 530
      },
      {
        id: "yt-8sLS2knUa6Y-diljit",
        title: "Kinni Kinni",
        artist: "Diljit Dosanjh",
        artwork: "https://img.youtube.com/vi/8sLS2knUa6Y/hqdefault.jpg",
        duration: 205,
        source: "youtube",
        youtubeId: "8sLS2knUa6Y",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=8sLS2knUa6Y",
        likes: 140,
        playCount: 460
      },
      {
        id: "yt-ElZfdU54Cp8-diljit",
        title: "Hass Hass",
        artist: "Diljit Dosanjh, Sia",
        artwork: "https://img.youtube.com/vi/ElZfdU54Cp8/hqdefault.jpg",
        duration: 165,
        source: "youtube",
        youtubeId: "ElZfdU54Cp8",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=ElZfdU54Cp8",
        likes: 155,
        playCount: 490
      }
    ]
  },
  {
    id: "yt-pl-karan-aujla-hits",
    name: "Karan Aujla - Street & Global Hits",
    author: "Karan Aujla Official",
    source: "youtube",
    genre: "Punjabi",
    artwork: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
    originalUrl: "https://music.youtube.com/channel/UCJ8rWqR5qZgT8Pq4V16a_Qw",
    trackCount: 5,
    likes: 310,
    views: 1720,
    tracks: [
      {
        id: "yt-kJQP7kiw5Fk",
        title: "Tauba Tauba (Bad Newz)",
        artist: "Karan Aujla",
        artwork: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
        duration: 212,
        source: "youtube",
        youtubeId: "kJQP7kiw5Fk",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
        likes: 290,
        playCount: 910
      },
      {
        id: "yt-hXh3SRG8064",
        title: "Softly (Making Memories)",
        artist: "Karan Aujla, Ikky",
        artwork: "https://img.youtube.com/vi/hXh3SRG8064/hqdefault.jpg",
        duration: 155,
        source: "youtube",
        youtubeId: "hXh3SRG8064",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=hXh3SRG8064",
        likes: 260,
        playCount: 840
      },
      {
        id: "yt-n_FCrCQ6-bY-karan",
        title: "White Brown Black",
        artist: "Karan Aujla, Avvy Sra",
        artwork: "https://img.youtube.com/vi/n_FCrCQ6-bY/hqdefault.jpg",
        duration: 180,
        source: "youtube",
        youtubeId: "n_FCrCQ6-bY",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=n_FCrCQ6-bY",
        likes: 180,
        playCount: 560
      },
      {
        id: "yt-ElZfdU54Cp8-karan",
        title: "Admiring You",
        artist: "Karan Aujla, Preston Pablo",
        artwork: "https://img.youtube.com/vi/ElZfdU54Cp8/hqdefault.jpg",
        duration: 215,
        source: "youtube",
        youtubeId: "ElZfdU54Cp8",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=ElZfdU54Cp8",
        likes: 170,
        playCount: 520
      },
      {
        id: "yt-6x7qO3y1wY8-karan",
        title: "Winning Speech",
        artist: "Karan Aujla, Mxrci",
        artwork: "https://img.youtube.com/vi/6x7qO3y1wY8/hqdefault.jpg",
        duration: 235,
        source: "youtube",
        youtubeId: "6x7qO3y1wY8",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=6x7qO3y1wY8",
        likes: 195,
        playCount: 610
      }
    ]
  },
  {
    id: "yt-pl-ap-dhillon-brown-munde",
    name: "AP Dhillon - Brown Munde Experience",
    author: "Run-Up Records",
    source: "youtube",
    genre: "Punjabi",
    artwork: "https://img.youtube.com/vi/VNs_cCtdbPc/hqdefault.jpg",
    originalUrl: "https://music.youtube.com/channel/UC-q8y17sV12y9zX0tQ",
    trackCount: 5,
    likes: 275,
    views: 1540,
    tracks: [
      {
        id: "yt-VNs_cCtdbPc",
        title: "Brown Munde",
        artist: "AP Dhillon, Gurinder Gill, Shinda Kahlon",
        artwork: "https://img.youtube.com/vi/VNs_cCtdbPc/hqdefault.jpg",
        duration: 268,
        source: "youtube",
        youtubeId: "VNs_cCtdbPc",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=VNs_cCtdbPc",
        likes: 290,
        playCount: 920
      },
      {
        id: "yt-x1P6p-V0q2s",
        title: "Insane",
        artist: "AP Dhillon, Gurinder Gill, Shinda Kahlon",
        artwork: "https://img.youtube.com/vi/x1P6p-V0q2s/hqdefault.jpg",
        duration: 206,
        source: "youtube",
        youtubeId: "x1P6p-V0q2s",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=x1P6p-V0q2s",
        likes: 210,
        playCount: 680
      },
      {
        id: "yt-vX2cDW8LUWk",
        title: "Excuses",
        artist: "AP Dhillon, Gurinder Gill",
        artwork: "https://img.youtube.com/vi/vX2cDW8LUWk/hqdefault.jpg",
        duration: 176,
        source: "youtube",
        youtubeId: "vX2cDW8LUWk",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=vX2cDW8LUWk",
        likes: 230,
        playCount: 740
      },
      {
        id: "yt-w_xQ88_1qA0",
        title: "With You",
        artist: "AP Dhillon",
        artwork: "https://img.youtube.com/vi/w_xQ88_1qA0/hqdefault.jpg",
        duration: 154,
        source: "youtube",
        youtubeId: "w_xQ88_1qA0",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=w_xQ88_1qA0",
        likes: 180,
        playCount: 570
      },
      {
        id: "yt-p9KkP3_Y0zY-ap",
        title: "Summer High",
        artist: "AP Dhillon",
        artwork: "https://img.youtube.com/vi/p9KkP3_Y0zY/hqdefault.jpg",
        duration: 178,
        source: "youtube",
        youtubeId: "p9KkP3_Y0zY",
        genre: "Punjabi",
        streamUrl: "https://www.youtube.com/watch?v=p9KkP3_Y0zY",
        likes: 165,
        playCount: 510
      }
    ]
  },
  {
    id: "yt-pl-bhojpuri-superstar-hits",
    name: "Bhojpuri Superhits - Pawan Singh & Khesari Lal",
    author: "Bhojpuri Dhamaka",
    source: "youtube",
    genre: "Bhojpuri",
    artwork: "https://img.youtube.com/vi/8b1T8zN8eQw/hqdefault.jpg",
    originalUrl: "https://music.youtube.com/search?q=bhojpuri+hits",
    trackCount: 7,
    likes: 310,
    views: 1880,
    tracks: [
      {
        id: "yt-8b1T8zN8eQw",
        title: "Lollipop Lagelu",
        artist: "Pawan Singh",
        artwork: "https://img.youtube.com/vi/8b1T8zN8eQw/hqdefault.jpg",
        duration: 250,
        source: "youtube",
        youtubeId: "8b1T8zN8eQw",
        genre: "Bhojpuri",
        streamUrl: "https://www.youtube.com/watch?v=8b1T8zN8eQw",
        likes: 260,
        playCount: 820
      },
      {
        id: "yt-u7b7g-6V-6I",
        title: "Kamariya Patre Patre",
        artist: "Pawan Singh, Shilpi Raj",
        artwork: "https://img.youtube.com/vi/u7b7g-6V-6I/hqdefault.jpg",
        duration: 215,
        source: "youtube",
        youtubeId: "u7b7g-6V-6I",
        genre: "Bhojpuri",
        streamUrl: "https://www.youtube.com/watch?v=u7b7g-6V-6I",
        likes: 195,
        playCount: 630
      },
      {
        id: "yt-p8F88p1q1i4",
        title: "Hari Hari Odhani",
        artist: "Pawan Singh, Anupama Yadav",
        artwork: "https://img.youtube.com/vi/p8F88p1q1i4/hqdefault.jpg",
        duration: 230,
        source: "youtube",
        youtubeId: "p8F88p1q1i4",
        genre: "Bhojpuri",
        streamUrl: "https://www.youtube.com/watch?v=p8F88p1q1i4",
        likes: 210,
        playCount: 690
      },
      {
        id: "yt-09V8G2rZ1c8",
        title: "Pudina Ae Haseena",
        artist: "Pawan Singh, Anupama Yadav",
        artwork: "https://img.youtube.com/vi/09V8G2rZ1c8/hqdefault.jpg",
        duration: 260,
        source: "youtube",
        youtubeId: "09V8G2rZ1c8",
        genre: "Bhojpuri",
        streamUrl: "https://www.youtube.com/watch?v=09V8G2rZ1c8",
        likes: 185,
        playCount: 580
      },
      {
        id: "yt-VvQ_3_8B_V0",
        title: "Nathuniya",
        artist: "Khesari Lal Yadav, Priyanka Singh",
        artwork: "https://img.youtube.com/vi/VvQ_3_8B_V0/hqdefault.jpg",
        duration: 210,
        source: "youtube",
        youtubeId: "VvQ_3_8B_V0",
        genre: "Bhojpuri",
        streamUrl: "https://www.youtube.com/watch?v=VvQ_3_8B_V0",
        likes: 230,
        playCount: 720
      },
      {
        id: "yt-i4Oq_t7Z87o",
        title: "Saj Ke Sawar Ke",
        artist: "Khesari Lal Yadav, Priyanka Singh",
        artwork: "https://img.youtube.com/vi/i4Oq_t7Z87o/hqdefault.jpg",
        duration: 220,
        source: "youtube",
        youtubeId: "i4Oq_t7Z87o",
        genre: "Bhojpuri",
        streamUrl: "https://www.youtube.com/watch?v=i4Oq_t7Z87o",
        likes: 170,
        playCount: 540
      },
      {
        id: "yt-0l8Z7R6X_0w",
        title: "Nehiya Ke Phool",
        artist: "Shilpi Raj",
        artwork: "https://img.youtube.com/vi/0l8Z7R6X_0w/hqdefault.jpg",
        duration: 195,
        source: "youtube",
        youtubeId: "0l8Z7R6X_0w",
        genre: "Bhojpuri",
        streamUrl: "https://www.youtube.com/watch?v=0l8Z7R6X_0w",
        likes: 145,
        playCount: 470
      }
    ]
  },
  {
    id: "yt-pl-the-weeknd-hits",
    name: "The Weeknd - After Hours & Pop Anthems",
    author: "The Weeknd Official",
    source: "youtube",
    genre: "English",
    artwork: "https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
    originalUrl: "https://music.youtube.com/channel/UC0WP5P-ufpRfjbNrmOWwLBQ",
    trackCount: 5,
    likes: 360,
    views: 2100,
    tracks: [
      {
        id: "yt-4NRXx6U8ABQ",
        title: "Blinding Lights",
        artist: "The Weeknd",
        artwork: "https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
        duration: 200,
        source: "youtube",
        youtubeId: "4NRXx6U8ABQ",
        genre: "English",
        streamUrl: "https://www.youtube.com/watch?v=4NRXx6U8ABQ",
        likes: 380,
        playCount: 1200
      },
      {
        id: "yt-dqt8Z1k0oWQ",
        title: "Starboy",
        artist: "The Weeknd, Daft Punk",
        artwork: "https://img.youtube.com/vi/dqt8Z1k0oWQ/hqdefault.jpg",
        duration: 230,
        source: "youtube",
        youtubeId: "dqt8Z1k0oWQ",
        genre: "English",
        streamUrl: "https://www.youtube.com/watch?v=dqt8Z1k0oWQ",
        likes: 290,
        playCount: 940
      },
      {
        id: "yt-XXYlFuWEuKi",
        title: "Save Your Tears",
        artist: "The Weeknd",
        artwork: "https://img.youtube.com/vi/XXYlFuWEuKi/hqdefault.jpg",
        duration: 215,
        source: "youtube",
        youtubeId: "XXYlFuWEuKi",
        genre: "English",
        streamUrl: "https://www.youtube.com/watch?v=XXYlFuWEuKi",
        likes: 275,
        playCount: 890
      },
      {
        id: "yt-QLCpqdqeoII",
        title: "Die For You",
        artist: "The Weeknd",
        artwork: "https://img.youtube.com/vi/QLCpqdqeoII/hqdefault.jpg",
        duration: 260,
        source: "youtube",
        youtubeId: "QLCpqdqeoII",
        genre: "English",
        streamUrl: "https://www.youtube.com/watch?v=QLCpqdqeoII",
        likes: 240,
        playCount: 760
      },
      {
        id: "yt-yzTuBuRdAyA",
        title: "The Hills",
        artist: "The Weeknd",
        artwork: "https://img.youtube.com/vi/yzTuBuRdAyA/hqdefault.jpg",
        duration: 242,
        source: "youtube",
        youtubeId: "yzTuBuRdAyA",
        genre: "English",
        streamUrl: "https://www.youtube.com/watch?v=yzTuBuRdAyA",
        likes: 220,
        playCount: 710
      }
    ]
  },
  {
    id: "yt-pl-taylor-swift-eras",
    name: "Taylor Swift - The Eras Collection",
    author: "Taylor Swift Official",
    source: "youtube",
    genre: "English",
    artwork: "https://img.youtube.com/vi/ic8j13piLuA/hqdefault.jpg",
    originalUrl: "https://music.youtube.com/channel/UCqECaJ8Gagnn7YCbPEzWH6g",
    trackCount: 5,
    likes: 390,
    views: 2250,
    tracks: [
      {
        id: "yt-ic8j13piLuA",
        title: "Cruel Summer",
        artist: "Taylor Swift",
        artwork: "https://img.youtube.com/vi/ic8j13piLuA/hqdefault.jpg",
        duration: 178,
        source: "youtube",
        youtubeId: "ic8j13piLuA",
        genre: "English",
        streamUrl: "https://www.youtube.com/watch?v=ic8j13piLuA",
        likes: 340,
        playCount: 1100
      },
      {
        id: "yt-b1kbLwvqugk",
        title: "Anti-Hero (Midnights)",
        artist: "Taylor Swift",
        artwork: "https://img.youtube.com/vi/b1kbLwvqugk/hqdefault.jpg",
        duration: 200,
        source: "youtube",
        youtubeId: "b1kbLwvqugk",
        genre: "English",
        streamUrl: "https://www.youtube.com/watch?v=b1kbLwvqugk",
        likes: 280,
        playCount: 890
      },
      {
        id: "yt-e-ORhEE9VVg",
        title: "Blank Space (1989)",
        artist: "Taylor Swift",
        artwork: "https://img.youtube.com/vi/e-ORhEE9VVg/hqdefault.jpg",
        duration: 231,
        source: "youtube",
        youtubeId: "e-ORhEE9VVg",
        genre: "English",
        streamUrl: "https://www.youtube.com/watch?v=e-ORhEE9VVg",
        likes: 310,
        playCount: 980
      },
      {
        id: "yt-nfWlot6h_JM",
        title: "Shake It Off",
        artist: "Taylor Swift",
        artwork: "https://img.youtube.com/vi/nfWlot6h_JM/hqdefault.jpg",
        duration: 242,
        source: "youtube",
        youtubeId: "nfWlot6h_JM",
        genre: "English",
        streamUrl: "https://www.youtube.com/watch?v=nfWlot6h_JM",
        likes: 270,
        playCount: 850
      },
      {
        id: "yt-8xg3vE8Ie_E",
        title: "Love Story (Taylor's Version)",
        artist: "Taylor Swift",
        artwork: "https://img.youtube.com/vi/8xg3vE8Ie_E/hqdefault.jpg",
        duration: 235,
        source: "youtube",
        youtubeId: "8xg3vE8Ie_E",
        genre: "English",
        streamUrl: "https://www.youtube.com/watch?v=8xg3vE8Ie_E",
        likes: 255,
        playCount: 810
      }
    ]
  },
  {
    id: "yt-pl-alan-walker-edm",
    name: "Alan Walker - EDM Anthems & Chill",
    author: "Alan Walker Official",
    source: "youtube",
    genre: "EDM",
    artwork: "https://img.youtube.com/vi/60ItHLz5WEA/hqdefault.jpg",
    originalUrl: "https://music.youtube.com/channel/UCJrOt22oN17WdqCsVmH-DYg",
    trackCount: 5,
    likes: 295,
    views: 1680,
    tracks: [
      {
        id: "yt-60ItHLz5WEA",
        title: "Faded",
        artist: "Alan Walker, Iselin Solheim",
        artwork: "https://img.youtube.com/vi/60ItHLz5WEA/hqdefault.jpg",
        duration: 212,
        source: "youtube",
        youtubeId: "60ItHLz5WEA",
        genre: "EDM",
        streamUrl: "https://www.youtube.com/watch?v=60ItHLz5WEA",
        likes: 310,
        playCount: 990
      },
      {
        id: "yt-wJnBTPUQS5A",
        title: "The Spectre",
        artist: "Alan Walker",
        artwork: "https://img.youtube.com/vi/wJnBTPUQS5A/hqdefault.jpg",
        duration: 193,
        source: "youtube",
        youtubeId: "wJnBTPUQS5A",
        genre: "EDM",
        streamUrl: "https://www.youtube.com/watch?v=wJnBTPUQS5A",
        likes: 240,
        playCount: 770
      },
      {
        id: "yt-1-xGerv5FOk",
        title: "Alone",
        artist: "Alan Walker, Noonie Bao",
        artwork: "https://img.youtube.com/vi/1-xGerv5FOk/hqdefault.jpg",
        duration: 161,
        source: "youtube",
        youtubeId: "1-xGerv5FOk",
        genre: "EDM",
        streamUrl: "https://www.youtube.com/watch?v=1-xGerv5FOk",
        likes: 220,
        playCount: 700
      },
      {
        id: "yt-dhYOPzcsbGM",
        title: "On My Way",
        artist: "Alan Walker, Sabrina Carpenter, Farruko",
        artwork: "https://img.youtube.com/vi/dhYOPzcsbGM/hqdefault.jpg",
        duration: 217,
        source: "youtube",
        youtubeId: "dhYOPzcsbGM",
        genre: "EDM",
        streamUrl: "https://www.youtube.com/watch?v=dhYOPzcsbGM",
        likes: 215,
        playCount: 680
      },
      {
        id: "yt-M-P4QBt-FWw",
        title: "Darkside",
        artist: "Alan Walker, Au/Ra, Tomine Harket",
        artwork: "https://img.youtube.com/vi/M-P4QBt-FWw/hqdefault.jpg",
        duration: 211,
        source: "youtube",
        youtubeId: "M-P4QBt-FWw",
        genre: "EDM",
        streamUrl: "https://www.youtube.com/watch?v=M-P4QBt-FWw",
        likes: 190,
        playCount: 600
      }
    ]
  }
];

// Extract all default tracks flattened
export const DEFAULT_COMMUNITY_TRACKS = DEFAULT_ARTIST_PLAYLISTS.flatMap(pl =>
  pl.tracks.map(t => ({ ...t, playlistName: pl.name, playlistId: pl.id }))
);

/**
 * Auto-sync disabled to prevent populating obsolete tracks
 */
export async function autoSyncDefaultPlaylistsToFirestore() {
  return;
}

/**
 * Save an imported playlist to Firebase Firestore Community Collection
 */
export async function saveCommunityPlaylist(playlistData) {
  try {
    const playlistRef = doc(db, 'community_playlists', playlistData.id);
    const payload = {
      ...playlistData,
      likes: 1,
      views: 1,
      createdAt: serverTimestamp()
    };
    await setDoc(playlistRef, payload, { merge: true });
  } catch (err) {
    console.warn('Firestore write error, saving to local cache fallback:', err);
  }

  // Always update local cache fallback
  saveToLocalCache('playlist', playlistData);
  return playlistData;
}

/**
 * Save an imported single track to Firebase Firestore
 */
export async function saveCommunityTrack(trackData) {
  try {
    const trackRef = doc(db, 'community_tracks', trackData.id);
    const payload = {
      ...trackData,
      likes: 1,
      playCount: 1,
      createdAt: serverTimestamp()
    };
    await setDoc(trackRef, payload, { merge: true });
  } catch (err) {
    console.warn('Firestore write track error, saving to local cache:', err);
  }

  saveToLocalCache('track', trackData);
  return trackData;
}

/**
 * Fetch all shared community playlists
 */
export async function fetchCommunityPlaylists(maxLimit = 50) {
  try {
    const q = query(
      collection(db, 'community_playlists'),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    );
    const snapshot = await getDocs(q);
    const results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });

    if (results.length > 0) {
      // Merge with default dataset for any missing IDs
      const existingIds = new Set(results.map(r => r.id));
      const combined = [
        ...results,
        ...DEFAULT_ARTIST_PLAYLISTS.filter(p => !existingIds.has(p.id))
      ];
      return combined;
    }
  } catch (err) {
    console.warn('Could not fetch Firestore playlists, using local fallback:', err);
  }

  // Trigger auto-sync in background so Firestore gets populated
  autoSyncDefaultPlaylistsToFirestore().catch(() => {});

  const local = getLocalCache('playlists');
  if (local.length > 0) {
    const existingIds = new Set(local.map(r => r.id));
    return [...local, ...DEFAULT_ARTIST_PLAYLISTS.filter(p => !existingIds.has(p.id))];
  }
  return DEFAULT_ARTIST_PLAYLISTS;
}

/**
 * Fetch all shared community tracks
 */
export async function fetchCommunityTracks(maxLimit = 60) {
  try {
    const q = query(
      collection(db, 'community_tracks'),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    );
    const snapshot = await getDocs(q);
    const results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });

    if (results.length > 0) {
      const existingIds = new Set(results.map(r => r.id));
      const combined = [
        ...results,
        ...DEFAULT_COMMUNITY_TRACKS.filter(t => !existingIds.has(t.id))
      ];
      return combined;
    }
  } catch (err) {
    console.warn('Could not fetch Firestore tracks, using local fallback:', err);
  }

  const local = getLocalCache('tracks');
  if (local.length > 0) {
    const existingIds = new Set(local.map(r => r.id));
    return [...local, ...DEFAULT_COMMUNITY_TRACKS.filter(t => !existingIds.has(t.id))];
  }
  return DEFAULT_COMMUNITY_TRACKS;
}

/**
 * Upload custom audio file and album art to Firebase Storage
 */
export async function uploadCustomAudio({ audioFile, imageFile, metadata, onProgress }) {
  const timestamp = Date.now();
  const audioStorageRef = ref(storage, `audio_uploads/${timestamp}_${audioFile.name}`);

  // 1. Upload Audio file
  const audioUploadTask = uploadBytesResumable(audioStorageRef, audioFile);

  const audioUrl = await new Promise((resolve, reject) => {
    audioUploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(audioUploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });

  // 2. Upload image if provided
  let imageUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';
  if (imageFile) {
    const imageStorageRef = ref(storage, `artwork_uploads/${timestamp}_${imageFile.name}`);
    const imageUploadTask = await uploadBytesResumable(imageStorageRef, imageFile);
    imageUrl = await getDownloadURL(imageUploadTask.ref);
  }

  // 3. Construct Track Object
  const newTrack = {
    id: `custom-upload-${timestamp}`,
    title: metadata.title || audioFile.name.replace(/\.[^/.]+$/, ''),
    artist: metadata.artist || 'Community Creator',
    artwork: imageUrl,
    duration: metadata.duration || 180,
    genre: metadata.genre || 'Indie Upload',
    source: 'direct',
    streamUrl: audioUrl,
    likes: 1,
    playCount: 1,
    createdAt: new Date().toISOString()
  };

  // Save to Firestore
  await saveCommunityTrack(newTrack);
  return newTrack;
}

// LocalStorage helpers for offline resiliency
function saveToLocalCache(type, item) {
  try {
    const raw = localStorage.getItem(LOCAL_COMMUNITY_KEY);
    const cache = raw ? JSON.parse(raw) : { playlists: [], tracks: [] };
    if (type === 'playlist') {
      cache.playlists = [item, ...cache.playlists.filter(p => p.id !== item.id)];
    } else {
      cache.tracks = [item, ...cache.tracks.filter(t => t.id !== item.id)];
    }
    localStorage.setItem(LOCAL_COMMUNITY_KEY, JSON.stringify(cache));
  } catch (e) {}
}

function getLocalCache(type) {
  try {
    const raw = localStorage.getItem(LOCAL_COMMUNITY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed[type] || [];
  } catch {
    return [];
  }
}

