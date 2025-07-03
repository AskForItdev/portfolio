Portfolio Under Construction

Detta repository innehåller en pågående portfolio-app där varje mapp under app/projects är ett fristående mikroprojekt jag jobbar på med varierande prioritet. Syftet är att demonstrera mina tekniska färdigheter och arbetsflöden i olika ramverk och koncept.

🚧 Status

Appen är under utveckling och funktionalitet kan förändras snabbt.
Det mesta av min tid läggs just nu på sidan jag bygger för småskaligt. Det visar sig att saker och ting tar tid och att man inte kan göra allt på en gång-

Innehåller experimentella projekt för UI-komponenter, datahantering och auth.

🔧 Teknisk stack

Next.js 15 – Sidor & API-routes

React 19 – UI-komponenter

Tailwind CSS 3 – Design & styling

Supabase – Autentisering och datalager

Context API – Global state (Theme, User, Data)

📁 Relevant projektstruktur

app/
├── api/                   # Backend endpoints (t.ex. auth, data)
├── components/            # Återanvändbara UI-komponenter
│   ├── Buttons/           # Laddnings- och klickknappar
│   ├── Cards/             # CreatorCard, ProjectCard + mockdata
│   ├── AuthWrapper.jsx    # Begränsar tillgången till sidan
│   ├── header.jsx         # Header med navbar som är både statisk och dynamisk visad på sidan.
│   └── ...                # Övriga planerade förslag som jag fått (Timer, Networth)
├── context/               # Theme, User och Data context providers
├── home/                  # Startsida (/)
├── login/                 # Login-sida
├── profile/               # Användarprofil
├── projects/              # Vart jag visar mina små projekt
│   ├── dennisidea/        # Skall eventuellt vara någon casino inspirerad sida
│   ├── homefinance/       # Är beställt av min sambo för hemma-ekonomi.
│   ├── realnetworth/      # Tänkt att vara en mer sofistikerad finansportfölj-tracker.
│   ├── smaskaligt/        # Kreatörsfilter som jag bygger för Småskaligt. (tar i princip all tid just nu)
│   └── timer/             # Enkel timer-komponent, är tanken.
└── layout.jsx             # Global layout & providers

