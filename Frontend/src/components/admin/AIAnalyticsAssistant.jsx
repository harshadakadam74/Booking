import { useCallback, useEffect, useState } from 'react';
import { BarChart3, LoaderCircle, RefreshCw, Send, Sparkles } from 'lucide-react';
import { askAIAdminInsight, fetchAIAdminOverview } from '../../services/aiService';

const formatNumber = (value) => Number(value || 0).toLocaleString();

const AIAnalyticsAssistant = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState('');
  const [questionResult, setQuestionResult] = useState(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOverview(await fetchAIAdminOverview());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const askQuestion = async (event) => {
    event.preventDefault();
    if (question.trim().length < 3 || questionLoading) return;
    setQuestionLoading(true);
    setQuestionError('');
    setQuestionResult(null);
    try {
      setQuestionResult(await askAIAdminInsight(question.trim()));
    } catch (requestError) {
      setQuestionError(requestError.message);
    } finally {
      setQuestionLoading(false);
    }
  };

  const metrics = overview?.metrics;

  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-800"><Sparkles size={21} /></div>
          <div><h2 className="text-xl font-bold text-slate-900">AI booking analytics</h2><p className="text-sm text-slate-500">Aggregate booking/payment records only</p></div>
        </div>
        <button type="button" onClick={loadOverview} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}Refresh
        </button>
      </div>

      {loading && <div className="flex items-center gap-2 py-6 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" />Loading booking statistics...</div>}
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}<button type="button" onClick={loadOverview} className="ml-2 font-bold underline">Retry</button></div>}

      {metrics && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Total bookings', metrics.totalBookings],
              ['Confirmed bookings', metrics.confirmedBookings],
              ['Paid bookings', metrics.paidBookings],
              ['Pending bookings', metrics.pendingBookings],
              ['Cancelled bookings', metrics.cancelledBookings],
              ['Paid revenue', `${formatNumber(metrics.paidRevenue)} stored units`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-extrabold text-blue-950">{typeof value === 'number' ? formatNumber(value) : value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="flex items-center gap-2 font-bold text-slate-900"><BarChart3 size={18} className="text-blue-800" />Monthly booking trends (up to 12 months)</h3>
              {metrics.monthlyTrends.length ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {metrics.monthlyTrends.map((month) => <li key={month._id} className="flex justify-between gap-3 border-b border-slate-100 pb-2"><span className="font-medium text-slate-700">{month._id}</span><span className="text-right text-slate-600">{formatNumber(month.bookings)} bookings · {formatNumber(month.paidRevenue)} paid units</span></li>)}
                </ul>
              ) : <p className="mt-3 text-sm text-slate-500">No booking history is available for the trend window.</p>}
              {!metrics.trendAnalysisAvailable && <p className="mt-3 text-xs leading-5 text-amber-800">There is not enough historical data for reliable trend analysis.</p>}
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900">AI business suggestions</h3>
              {overview.ai.available ? (
                <>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">{overview.ai.insights.map((insight, index) => <li key={`${index}-${insight}`}>{insight}</li>)}</ul>
                  <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">{overview.ai.limitations}</p>
                </>
              ) : <p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{overview.ai.message} Actual statistics above remain available.</p>}
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900">Ask about booking analytics</h3>
            <p className="mt-1 text-xs text-slate-500">Answers use aggregate booking/payment metrics only. Customer identities and unsupported reports are not exposed.</p>
            <form onSubmit={askQuestion} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="admin-ai-question">Ask an analytics question</label>
              <input id="admin-ai-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} minLength={3} required placeholder="How has paid revenue changed over the available months?" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <button type="submit" disabled={questionLoading || question.trim().length < 3} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                {questionLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
                Ask
              </button>
            </form>
            {questionError && <p role="alert" className="mt-3 text-sm text-red-700">{questionError}</p>}
            {questionResult && (
              <div className="mt-3 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-950">{questionResult.ai.question || question}</p>
                {questionResult.ai.available
                  ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{questionResult.ai.insights.map((insight, index) => <li key={`${index}-${insight}`}>{insight}</li>)}</ul>
                  : <p role="status" className="mt-2 text-sm text-amber-900">{questionResult.ai.message}</p>}
                {questionResult.ai.limitations && <p className="mt-2 text-xs text-slate-600">{questionResult.ai.limitations}</p>}
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-500">Revenue includes only bookings with paymentStatus SUCCESS. AI suggestions are advisory and cannot modify booking or payment records.</p>
        </>
      )}
    </section>
  );
};

export default AIAnalyticsAssistant;
