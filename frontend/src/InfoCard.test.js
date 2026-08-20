import { render, screen } from '@testing-library/react';
import InfoCard from './InfoCard';

describe('InfoCard', () => {
  it('prikazuje title, value i icon', () => {
    render(<InfoCard title="Stars" value={1234} icon="⭐" />);

    expect(screen.getByText('Stars')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('prikazuje subValue kada je prosleđen', () => {
    render(<InfoCard title="Forks" value={10} subValue="+2 ove nedelje" icon="🍴" />);

    expect(screen.getByText('+2 ove nedelje')).toBeInTheDocument();
  });

  it('ne prikazuje subValue kada nije prosleđen', () => {
    const { container } = render(<InfoCard title="Forks" value={10} icon="🍴" />);

    expect(screen.queryByText(/ove nedelje/)).not.toBeInTheDocument();
    // desni deo ima samo span sa ikonicom, bez dodatnog div-a
    const rightSide = container.querySelector('span').parentElement;
    expect(rightSide.children).toHaveLength(1);
  });
});