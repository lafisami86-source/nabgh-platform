import { pbkdf2Sync, randomBytes } from 'crypto';
import connectDB from '@/lib/mongodb';
import { Curriculum, Subject, Unit, Lesson, Exercise } from '@/models/Content';
import { Badge } from '@/models/Analytics';
import User from '@/models/User';

function hash(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `sha_${salt}$${hash}`;
}

export async function seedDatabase() {
  await connectDB();

  const seedEmails = ['admin@nabgh.com', 'student@nabgh.com', 'teacher@nabgh.com'];
  await User.deleteMany({ email: { $in: seedEmails } });

  await User.create([
    {
      email: 'admin@nabgh.com', password: hash('Admin@123456'), role: 'admin',
      profile: { firstName: 'مدير', lastName: 'النظام', displayName: 'مدير نبغ', country: 'SA' },
      isVerified: true, onboardingCompleted: true,
    },
    {
      email: 'student@nabgh.com', password: hash('Student@123'), role: 'student',
      profile: { firstName: 'أحمد', lastName: 'المحمد', displayName: 'أحمد المحمد', country: 'SA' },
      studentInfo: { educationLevel: 'primary', grade: 'grade_6', curriculum: 'saudi', dailyGoalMinutes: 30, subjects: [] },
      gamification: { xp: 2450, level: 3, streak: { current: 7, longest: 15, freezesRemaining: 1 }, totalLessonsCompleted: 12, totalExercisesSolved: 45, accuracy: 78 },
      isVerified: true, onboardingCompleted: true,
    },
    {
      email: 'teacher@nabgh.com', password: hash('Teacher@123'), role: 'teacher',
      profile: { firstName: 'سارة', lastName: 'الأحمد', displayName: 'سارة الأحمد', country: 'SA' },
      teacherInfo: {
        specialization: ['الرياضيات', 'العلوم'],
        subjects: ['math-grade6-sa', 'science-grade6-sa'],
        grades: ['grade_6', 'grade_5'],
        experience: 8,
        rating: { average: 4.7, count: 42 },
        verified: true,
      },
      isVerified: true, onboardingCompleted: true,
    },
  ]);

  console.log('✅ Seed users created');

  let curriculum = await Curriculum.findOne({ nameEn: 'Saudi' });
  if (!curriculum) {
    curriculum = await Curriculum.create({
      name: 'المنهج السعودي', nameEn: 'Saudi', country: 'SA',
      description: 'المنهج الدراسي لوزارة التعليم السعودية',
      levels: [
        { id: 'primary', name: 'المرحلة الابتدائية', order: 1, grades: [
          { id: 'grade_1', name: 'الصف الأول', order: 1, tracks: [] },
          { id: 'grade_2', name: 'الصف الثاني', order: 2, tracks: [] },
          { id: 'grade_3', name: 'الصف الثالث', order: 3, tracks: [] },
          { id: 'grade_4', name: 'الصف الرابع', order: 4, tracks: [] },
          { id: 'grade_5', name: 'الصف الخامس', order: 5, tracks: [] },
          { id: 'grade_6', name: 'الصف السادس', order: 6, tracks: [] },
        ]},
        { id: 'middle', name: 'المرحلة المتوسطة', order: 2, grades: [
          { id: 'grade_7', name: 'أول متوسط', order: 1, tracks: [] },
          { id: 'grade_8', name: 'ثاني متوسط', order: 2, tracks: [] },
          { id: 'grade_9', name: 'ثالث متوسط', order: 3, tracks: [] },
        ]},
        { id: 'high', name: 'المرحلة الثانوية', order: 3, grades: [
          { id: 'grade_10', name: 'أول ثانوي', order: 1, tracks: [] },
          { id: 'grade_11', name: 'ثاني ثانوي', order: 2, tracks: ['علمي','أدبي'] },
          { id: 'grade_12', name: 'ثالث ثانوي', order: 3, tracks: ['علمي','أدبي'] },
        ]},
      ],
    });
  }

  const subjectsData = [
    { name: 'الرياضيات', nameEn: 'Mathematics', slug: 'math-grade6-sa', icon: '🔢', color: '#3B82F6', grade: 'grade_6' },
    { name: 'العلوم', nameEn: 'Science', slug: 'science-grade6-sa', icon: '🔬', color: '#10B981', grade: 'grade_6' },
    { name: 'اللغة العربية', nameEn: 'Arabic', slug: 'arabic-grade6-sa', icon: '📖', color: '#F59E0B', grade: 'grade_6' },
    { name: 'اللغة الإنجليزية', nameEn: 'English', slug: 'english-grade6-sa', icon: '🌍', color: '#8B5CF6', grade: 'grade_6' },
    { name: 'الدراسات الإسلامية', nameEn: 'Islamic Studies', slug: 'islamic-grade6-sa', icon: '🕌', color: '#059669', grade: 'grade_6' },
  ];

  const createdSubjects: any[] = [];
  for (const s of subjectsData) {
    const sub = await Subject.findOneAndUpdate(
      { slug: s.slug },
      { $setOnInsert: { ...s, curriculumId: curriculum._id, description: `مادة ${s.name}`, unitsCount: 4, lessonsCount: 20, estimatedHours: 60, isFree: false, order: createdSubjects.length + 1 }},
      { upsert: true, new: true }
    );
    createdSubjects.push(sub);
  }

  const mathSub = createdSubjects[0];
  const adminUser = await User.findOne({ email: 'admin@nabgh.com' });

  const unitsData = [
    { title: 'الوحدة الأولى: الكسور', order: 1 },
    { title: 'الوحدة الثانية: الأعداد العشرية', order: 2 },
    { title: 'الوحدة الثالثة: الجبر', order: 3 },
    { title: 'الوحدة الرابعة: الهندسة', order: 4 },
  ];
  const createdUnits: any[] = [];
  for (const u of unitsData) {
    const unit = await Unit.findOneAndUpdate(
      { subjectId: mathSub._id, title: u.title },
      { $setOnInsert: { ...u, subjectId: mathSub._id, lessonsCount: 5, estimatedMinutes: 150, isLocked: false }},
      { upsert: true, new: true }
    );
    createdUnits.push(unit);
  }

  const unit1 = createdUnits[0];
  const lessons = [
    { title: 'مفهوم الكسر', slug: 'fraction-concept-g6', order: 1, difficulty: 'easy', xpReward: 50 },
    { title: 'الكسور المتكافئة', slug: 'equivalent-fractions-g6', order: 2, difficulty: 'medium', xpReward: 60 },
    { title: 'جمع الكسور ذات المقامات المتماثلة', slug: 'add-same-denom-g6', order: 3, difficulty: 'medium', xpReward: 70 },
    { title: 'طرح الكسور', slug: 'subtract-fractions-g6', order: 4, difficulty: 'medium', xpReward: 70 },
    { title: 'ضرب الكسور', slug: 'multiply-fractions-g6', order: 5, difficulty: 'hard', xpReward: 80 },
  ];

  for (const l of lessons) {
    await Lesson.findOneAndUpdate(
      { slug: l.slug },
      { $setOnInsert: {
        ...l, unitId: unit1._id, subjectId: mathSub._id, grade: 'grade_6',
        description: `درس ${l.title} للصف السادس`,
        objectives: [`فهم ${l.title}`, `حل مسائل على ${l.title}`, `تطبيق ${l.title}`],
        content: {
          type: 'mixed',
          video: { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 480, provider: 'cloudflare', thumbnailUrl: `https://picsum.photos/seed/${l.slug}/640/360` },
          article: { html: `<h2>${l.title}</h2><p>في هذا الدرس سنتعلم عن ${l.title}. الكسر هو طريقة لتمثيل جزء من كل، ويُكتب على شكل بسط/مقام.</p><p><strong>مثال:</strong> إذا قسّمنا دائرة إلى 4 أجزاء متساوية وأخذنا جزءاً واحداً، فإن الكسر الممثل هو 1/4.</p>`, readingTime: 5 },
        },
        summary: { text: `ملخص درس ${l.title}`, keyPoints: [`الكسر = بسط/مقام`, `البسط: عدد الأجزاء المأخوذة`, `المقام: مجموع الأجزاء المتساوية`] },
        flashcards: [
          { front: 'ما هو الكسر؟', back: 'جزء من كل، يُكتب بسط/مقام' },
          { front: 'ما البسط؟', back: 'العدد أعلى خط الكسر' },
          { front: 'ما المقام؟', back: 'العدد أسفل خط الكسر' },
        ],
        checkpoints: [{
          afterMinute: 3,
          question: { type: 'multiple-choice', text: 'في الكسر 3/5، ما هو المقام؟', options: [{ text: '3', isCorrect: false }, { text: '5', isCorrect: true }, { text: '8', isCorrect: false }, { text: '15', isCorrect: false }], explanation: 'المقام هو 5' },
        }],
        createdBy: adminUser._id, isPublished: true, publishedAt: new Date(),
        tags: ['كسور', 'رياضيات'],
        stats: { views: 200, completions: 80, avgRating: 4.5, ratingsCount: 20 },
      }},
      { upsert: true, new: true }
    );
  }

  const lesson1 = await Lesson.findOne({ slug: 'fraction-concept-g6' });
  if (lesson1) {
    await Exercise.findOneAndUpdate(
      { lessonId: lesson1._id },
      { $setOnInsert: {
        lessonId: lesson1._id, subjectId: mathSub._id,
        title: 'تمارين مفهوم الكسر', description: 'اختبر فهمك لمفهوم الكسر',
        type: 'practice',
        questions: [
          { order:1, type:'multiple-choice', text:'في الكسر 3/7، ما هو البسط؟', options:[{text:'7',isCorrect:false,feedback:'7 هو المقام'},{text:'3',isCorrect:true,feedback:'أحسنت!'},{text:'10',isCorrect:false},{text:'4',isCorrect:false}], explanation:'البسط هو 3', points:10, difficulty:'easy' },
          { order:2, type:'true-false', text:'الكسر 1/2 يساوي الكسر 2/4', correctBoolean:true, explanation:'1/2 = 2/4', points:10, difficulty:'easy' },
          { order:3, type:'fill-blank', text:'في الكسر 5/8، البسط = ___ والمقام = ___', blanks:[{position:0,acceptedAnswers:['5'],caseSensitive:false},{position:1,acceptedAnswers:['8'],caseSensitive:false}], explanation:'البسط=5 والمقام=8', points:15, difficulty:'easy' },
        ],
        settings:{ shuffleOptions:true, showExplanation:'immediately', allowRetry:true, maxAttempts:3, passingScore:60 },
        xpReward:{ completion:100, perfect:50 },
        isPublished:true, createdBy:adminUser._id,
      }},
      { upsert:true, new:true }
    );
  }

  const badgesData = [
    { _id:'lesson_10', name:'قارئ نهم', description:'أكمل 10 دروس', icon:'📚', category:'learning', rarity:'common', xpBonus:50 },
    { _id:'lesson_50', name:'مثقف', description:'أكمل 50 درساً', icon:'📖', category:'learning', rarity:'uncommon', xpBonus:150 },
    { _id:'lesson_100', name:'عالم', description:'أكمل 100 درس', icon:'🎓', category:'learning', rarity:'rare', xpBonus:300 },
    { _id:'exercises_100', name:'مجتهد', description:'حل 100 تمرين', icon:'✏️', category:'exercises', rarity:'common', xpBonus:100 },
    { _id:'streak_7', name:'ملتزم', description:'7 أيام متتالية', icon:'🔥', category:'streak', rarity:'common', xpBonus:100 },
    { _id:'streak_30', name:'مثابر', description:'30 يوماً متتالية', icon:'💪', category:'streak', rarity:'rare', xpBonus:500 },
    { _id:'streak_7', name:'أسطوري', description:'100 يوم متتالي', icon:'🌟', category:'streak', rarity:'legendary', xpBonus:1000 },
    { _id:'accuracy_95', name:'دقيق', description:'95%+ في اختبار', icon:'🎯', category:'exercises', rarity:'uncommon', xpBonus:75 },
    { _id:'perfect_5', name:'عبقري', description:'100% في 5 اختبارات', icon:'🧠', category:'achievement', rarity:'epic', xpBonus:250 },
    { _id:'first_lesson', name:'أول خطوة', description:'أكمل أول درس', icon:'🌱', category:'learning', rarity:'common', xpBonus:25 },
  ];
  for (const b of badgesData) {
    await Badge.findByIdAndUpdate(b._id, b, { upsert:true });
  }

  console.log('✅ Database seeded successfully');
  return { ok: true, message: 'Database seeded. You can now login with seed accounts.' };
}
