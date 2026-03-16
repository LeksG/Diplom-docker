'use client';

import { useState, useEffect } from 'react';

// Додаємо імпорт сервісу
import { ReviewService } from '@/services/api';

// Іконки
const ReplyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 rotate-180 scale-x-[-1]">
    <polyline points="15 10 20 15 15 20"></polyline>
    <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const StarRating = ({ rating, setRating, readOnly = false }: any) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && setRating(star)}
        className={`text-lg transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </button>
    ))}
  </div>
);

// Компонент одного відгуку
function ReviewItem({ review, onReply, onDelete, onEdit, productId, depth = 0, currentUser }: any) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Стан для форми
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(review.comment);
  const [editRating, setEditRating] = useState(review.rating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Права доступу
  const isOwner = currentUser && (currentUser.id === review.userId || currentUser.email === review.user?.email); 
  const isAdmin = currentUser?.role === 'ADMIN';
  const canEditOrDelete = isOwner || isAdmin;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onReply(productId, review.id, replyText, setIsSubmitting, () => {
      setIsReplying(false);
      setReplyText('');
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onEdit(review.id, editText, editRating, setIsSubmitting, () => {
      setIsEditing(false);
    });
  };

  const handleDeleteClick = () => {
    if (confirm('Видалити цей коментар?')) {
      onDelete(review.id);
    }
  };

  const isReply = depth > 0;
  
  return (
    <div className={`group ${isReply ? 'ml-6 mt-3' : 'border-b pb-6 mb-6 last:border-0'}`}>
      
      {/* Контейнер відгуку */}
      <div className="flex gap-3">
        {isReply && (
          <div className="flex-shrink-0 pt-1">
             <ReplyIcon />
          </div>
        )}

        <div className={`flex-grow ${isReply ? 'bg-gray-50 p-4 rounded-xl' : ''}`}>
          
          {/* Режим редагування */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-2">
               {depth === 0 && <StarRating rating={editRating} setRating={setEditRating} />}
               <textarea 
                 className="w-full p-2 border rounded-lg text-sm bg-white text-slate-900 font-medium"
                 value={editText}
                 onChange={e => setEditText(e.target.value)}
                 rows={2}
               />
               <div className="flex gap-2">
                 <button disabled={isSubmitting} className="bg-green-600 text-white text-xs px-3 py-1 rounded">Зберегти</button>
                 <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-slate-900 font-bold text-xs px-3 py-1 rounded">Скасувати</button>
               </div>
            </form>
          ) : (
            // Режим перегляду
            <>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-bold text-sm text-slate-900">{review.user?.fullName || 'Анонім'}</p>
                  <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                
                {/* Дії: Видалити/Редагувати */}
                {canEditOrDelete && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditing(true)} title="Редагувати" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                      <EditIcon />
                    </button>
                    <button onClick={handleDeleteClick} title="Видалити" className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                      <TrashIcon />
                    </button>
                  </div>
                )}
              </div>

              {depth === 0 && <div className="mb-2"><StarRating rating={review.rating} readOnly /></div>}
              
              
              <p className="text-slate-900 text-base font-medium leading-relaxed">{review.comment}</p>

              {/* Кнопка "Відповісти" */}
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900 mt-2 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-180 scale-x-[-1]"><polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>
                Відповісти
              </button>
            </>
          )}

          {/* Форма відповіді */}
          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-3 animate-fade-in-up">
              <textarea
                className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium placeholder-slate-400"
                rows={2}
                placeholder={`Відповідь для ${review.user?.fullName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsReplying(false)} className="text-xs font-bold text-slate-600 hover:text-slate-900">Скасувати</button>
                <button disabled={isSubmitting} className="bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-800">Надіслати</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Рекурсія для відповідей */}
      {review.replies && review.replies.length > 0 && (
        <div className="mt-1">
          {review.replies.map((reply: any) => (
            <ReviewItem 
              key={reply.id} 
              review={reply} 
              productId={productId}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              depth={depth + 1}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductReviews({ productId, reviews }: { productId: number, reviews: any[] }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Запобіжник: якщо reviews раптом undefined, робимо його порожнім масивом
  const safeReviews = reviews || [];

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // API Дії
  const submitReview = async (prodId: number, parentId: number | null, text: string, setLoading: any, onSuccess: any, ratingVal = 0) => {
    if (!currentUser) return alert('Увійдіть, щоб залишити коментар');
    if (!parentId && ratingVal === 0) return alert('Будь ласка, поставте оцінку');

    setLoading(true);
    try {
      await ReviewService.create({
        productId: prodId,
        email: currentUser.email,
        rating: ratingVal,
        comment: text,
        parentId: parentId
      });

      onSuccess();
      window.location.reload(); 
    } catch (error: any) {
      alert(error.message || 'Помилка сервера');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!currentUser) return;
    try {
      await ReviewService.delete(reviewId, { email: currentUser.email });
      window.location.reload();
    } catch (e: any) { 
      alert(e.message || 'Помилка при видаленні'); 
    }
  };

  const editReview = async (reviewId: number, newText: string, newRating: number, setLoading: any, onSuccess: any) => {
    setLoading(true);
    try {
      await ReviewService.update(reviewId, { email: currentUser.email, comment: newText, rating: newRating });
      onSuccess();
      window.location.reload();
    } catch (e: any) { 
      alert(e.message || 'Помилка редагування'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview(productId, null, comment, setIsSubmitting, () => {
      setRating(0);
      setComment('');
    }, rating);
  };

  // Розрахунок середнього рейтингу (використовуємо safeReviews)
  const rootReviews = safeReviews.filter(r => !r.parentId && r.rating > 0);
  const averageRating = rootReviews.length 
      ? rootReviews.reduce((acc, r) => acc + r.rating, 0) / rootReviews.length 
      : 0;

  return (
    <div className="mt-16 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        Відгуки 
        <span className="text-sm font-bold text-slate-700 bg-gray-200 px-3 py-1 rounded-full">{safeReviews.length}</span>
      </h2>
      
      {/* Статистика */}
      <div className="flex items-center gap-6 mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <div className="text-center">
             <div className="text-5xl font-black text-slate-900 leading-none">{averageRating.toFixed(1)}</div>
             <div className="mt-2 flex justify-center"><StarRating rating={Math.round(averageRating)} readOnly /></div>
        </div>
        <div className="h-12 w-px bg-gray-300"></div>
        <div>
           <p className="text-slate-900 font-bold text-lg">Думки клієнтів</p>
           <p className="text-slate-700 font-medium">Поділіться своїм досвідом!</p>
        </div>
      </div>

      {/* Форма нового відгуку */}
      <form onSubmit={handleMainSubmit} className="mb-12 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
        <h3 className="font-bold text-xl mb-4 text-slate-900">Залишити відгук</h3>
        <div className="mb-4">
          <label className="block text-sm font-black text-slate-900 uppercase mb-2">Оцінка</label>
          <StarRating rating={rating} setRating={setRating} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-black text-slate-900 uppercase mb-2">Коментар</label>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900 transition bg-white text-slate-900 font-medium placeholder-slate-400"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Напишіть ваші враження..."
          />
        </div>
        <button disabled={isSubmitting} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg active:scale-95 disabled:opacity-70">
          {isSubmitting ? 'Публікація...' : '✨ Опублікувати'}
        </button>
      </form>

      {/* Список відгуків */}
      <div className="space-y-2">
        {safeReviews.map((review) => (
          <ReviewItem 
            key={review.id} 
            review={review} 
            productId={productId}
            onReply={submitReview}
            onDelete={deleteReview}
            onEdit={editReview}
            currentUser={currentUser}
          />
        ))}
        {safeReviews.length === 0 && (
          <div className="text-center py-10 text-slate-900 font-bold text-lg border-2 border-dashed border-gray-200 rounded-2xl">
            Відгуків поки немає. Будьте першим!
          </div>
        )}
      </div>
    </div>
  );
}